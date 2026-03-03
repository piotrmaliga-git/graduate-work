import argparse
import csv
import json
import time
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib import error, request


def parse_args() -> argparse.Namespace:
    backend_dir = Path(__file__).resolve().parent
    project_root = backend_dir.parent
    workspace_root = project_root.parent

    parser = argparse.ArgumentParser(
        description="Run batch phishing analysis by calling backend /analyze endpoint."
    )
    parser.add_argument(
        "--model",
        default="bielik-4bit",
        help="Model alias/name passed to API (default: bielik-4bit).",
    )
    parser.add_argument(
        "--api-url",
        default="http://127.0.0.1:8000",
        help="Base API URL (default: http://127.0.0.1:8000).",
    )
    parser.add_argument(
        "--input",
        default=str(workspace_root / "data" / "data.json"),
        help="Path to input JSON dataset.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Process only first N records.",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=90.0,
        help="HTTP timeout in seconds for single request (default: 90).",
    )
    parser.add_argument(
        "--pause",
        type=float,
        default=0.0,
        help="Pause in seconds between requests (default: 0).",
    )
    parser.add_argument(
        "--output-prefix",
        default=None,
        help="Output prefix path (without extension). By default saved in workspace /reports.",
    )
    return parser.parse_args()


def load_dataset(path: Path) -> list[dict]:
    with path.open("r", encoding="utf-8") as file:
        data = json.load(file)
    if not isinstance(data, list):
        raise ValueError("Input dataset must be a JSON array.")
    return data


def post_analyze(api_url: str, payload: dict, timeout: float) -> tuple[int, dict]:
    analyze_url = api_url.rstrip("/") + "/analyze"
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")

    req = request.Request(
        analyze_url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=timeout) as response:
            raw = response.read().decode("utf-8")
            parsed = json.loads(raw) if raw else {}
            return response.status, parsed
    except error.HTTPError as http_error:
        raw_error = http_error.read().decode("utf-8") if http_error.fp else ""
        parsed_error = {}
        if raw_error:
            try:
                parsed_error = json.loads(raw_error)
            except json.JSONDecodeError:
                parsed_error = {"detail": raw_error}
        if not parsed_error:
            parsed_error = {"detail": str(http_error)}
        return http_error.code, parsed_error


def compute_accuracy(rows: list[dict]) -> float | None:
    valid_rows = [
        row
        for row in rows
        if row.get("success")
        and row.get("prediction") in {"phishing", "legit"}
        and row.get("ground_truth") in {"phishing", "legit"}
    ]

    if not valid_rows:
        return None

    correct = sum(1 for row in valid_rows if row["prediction"] == row["ground_truth"])
    return round(correct / len(valid_rows), 4)


def save_outputs(output_prefix: Path, payload: dict, rows: list[dict]) -> tuple[Path, Path]:
    output_prefix.parent.mkdir(parents=True, exist_ok=True)
    json_path = output_prefix.with_suffix(".json")
    csv_path = output_prefix.with_suffix(".csv")

    with json_path.open("w", encoding="utf-8") as file:
        json.dump(payload, file, ensure_ascii=False, indent=2)

    fieldnames = [
        "id",
        "sender",
        "category",
        "ground_truth",
        "model",
        "prediction",
        "reason",
        "success",
        "http_status",
        "error",
        "timestamp",
    ]
    with csv_path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow({name: row.get(name) for name in fieldnames})

    return json_path, csv_path


def main() -> None:
    args = parse_args()

    input_path = Path(args.input).resolve()
    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")

    dataset = load_dataset(input_path)
    if args.limit is not None:
        dataset = dataset[: args.limit]

    if not dataset:
        raise ValueError("No records to process.")

    backend_dir = Path(__file__).resolve().parent
    project_root = backend_dir.parent
    workspace_root = project_root.parent
    reports_dir = workspace_root / "reports"

    safe_model = args.model.replace("/", "_").replace(":", "_")
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    default_prefix = reports_dir / f"api_batch_{safe_model}_{timestamp}"
    output_prefix = Path(args.output_prefix).resolve() if args.output_prefix else default_prefix

    rows: list[dict] = []
    total = len(dataset)
    print(f"Running {total} requests against {args.api_url.rstrip('/')}/analyze using model={args.model}")

    for index, item in enumerate(dataset, start=1):
        email_text = (item.get("text") or "").strip()
        sender = item.get("sender")
        payload = {
            "email_text": email_text,
            "model_name": args.model,
            "sender": sender,
        }

        if not email_text:
            row = {
                "id": item.get("id"),
                "text": email_text,
                "sender": sender,
                "category": item.get("category"),
                "ground_truth": item.get("ground_truth"),
                "model": args.model,
                "prediction": None,
                "reason": None,
                "success": False,
                "http_status": None,
                "error": "Empty text in dataset",
                "timestamp": None,
            }
            rows.append(row)
            print(f"[{index}/{total}] id={item.get('id')} -> skipped (empty text)")
            continue

        status, response_body = post_analyze(args.api_url, payload, args.timeout)
        row = {
            "id": item.get("id"),
            "text": email_text,
            "sender": sender,
            "category": item.get("category"),
            "ground_truth": item.get("ground_truth"),
            "model": args.model,
            "prediction": response_body.get("prediction") if status == 200 else None,
            "reason": response_body.get("reason") if status == 200 else None,
            "success": status == 200,
            "http_status": status,
            "error": None if status == 200 else response_body.get("detail") or str(response_body),
            "timestamp": response_body.get("timestamp") if status == 200 else None,
        }
        rows.append(row)

        result_label = row["prediction"] if row["success"] else "ERROR"
        print(f"[{index}/{total}] id={item.get('id')} -> {result_label}")

        if args.pause > 0 and index < total:
            time.sleep(args.pause)

    gt_counter = Counter((row.get("ground_truth") or "").lower() for row in rows)
    pred_counter = Counter((row.get("prediction") or "").lower() for row in rows if row.get("prediction"))
    success_count = sum(1 for row in rows if row["success"])
    accuracy = compute_accuracy(rows)

    summary = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "api_url": args.api_url,
        "input_file": str(input_path),
        "model": args.model,
        "total": len(rows),
        "success": success_count,
        "errors": len(rows) - success_count,
        "accuracy": accuracy,
        "ground_truth_distribution": dict(gt_counter),
        "prediction_distribution": dict(pred_counter),
    }

    output_payload = {
        "summary": summary,
        "items": rows,
    }
    json_path, csv_path = save_outputs(output_prefix, output_payload, rows)

    print("\nDone")
    print(f"- JSON: {json_path}")
    print(f"- CSV:  {csv_path}")
    print(f"- Success: {success_count}/{len(rows)}")
    if accuracy is not None:
        print(f"- Accuracy (valid rows): {accuracy}")


if __name__ == "__main__":
    main()
