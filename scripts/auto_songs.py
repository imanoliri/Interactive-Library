import os, time, json, pathlib, requests
from openai import OpenAI

from dotenv import load_dotenv

load_dotenv()  # reads API KEYS .env file


def create_poem(html_path, out_path, model="gpt-4o-mini"):
    """
    Read HTML → ask OpenAI for a short poem → write to TXT.
    """
    html = pathlib.Path(html_path).read_text(encoding="utf-8", errors="ignore")
    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    r = client.responses.create(
        model=model,
        input=[
            {
                "role": "system",
                "content": "Write a short, singable children's fantasy poem (12–20 lines).",
            },
            {
                "role": "user",
                "content": f"Here is the book HTML. Summarize mood & motifs as a poem:\n\n{html}",
            },
        ],
    )
    poem = r.output_text.strip()
    pathlib.Path(out_path).write_text(poem, encoding="utf-8")
    return poem


def create_song(poem_txt, out_mp3, model="chirp-v3-5", poll_s=180, step=5):
    """
    Read poem → call Suno → poll for audio_url → save MP3.
    """
    prompt = pathlib.Path(poem_txt).read_text(encoding="utf-8").strip()
    hdr = {
        "Authorization": f"Bearer {os.environ['SUNO_API_KEY']}",
        "Content-Type": "application/json",
    }
    start = requests.post(
        "https://api.sunoapi.org/api/v1/generate",
        headers=hdr,
        data=json.dumps({"prompt": prompt[:4000], "mv": model}),
        timeout=30,
    ).json()
    task_id = (start.get("data") or {}).get("taskId")
    deadline = time.time() + poll_s
    audio_url = None
    while time.time() < deadline and not audio_url:
        time.sleep(step)
        info = requests.get(
            "https://api.sunoapi.org/api/v1/generate/record-info",
            headers=hdr,
            params={"taskId": task_id},
            timeout=30,
        ).json()
        for s in (info.get("data") or {}).get("songs", []):
            audio_url = s.get("audio_url") or s.get("audioUrl")
            if audio_url:
                break
    mp3 = requests.get(audio_url, timeout=120).content
    pathlib.Path(out_mp3).write_bytes(mp3)
    return out_mp3
