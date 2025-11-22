import re
import unicodedata


def sanitize_filename(filename: str) -> str:
    """
    파일명 자동 정리
    - 특수문자 제거
    - 이모지 제거
    - 공백 정리
    - 길이 제한

    Args:
        filename: 원본 파일명

    Returns:
        정리된 파일명
    """
    # 1. 파일시스템 금지 문자 제거
    forbidden_chars = r'[<>:"/\\|?*]'
    filename = re.sub(forbidden_chars, '', filename)

    # 2. 제어 문자 제거
    filename = ''.join(char for char in filename if unicodedata.category(char)[0] != 'C')

    # 3. 이모지 제거 (유니코드 범위 기반)
    emoji_pattern = re.compile(
        "["
        u"\U0001F600-\U0001F64F"  # 이모티콘
        u"\U0001F300-\U0001F5FF"  # 기호 & 픽토그램
        u"\U0001F680-\U0001F6FF"  # 교통 & 지도
        u"\U0001F1E0-\U0001F1FF"  # 국기
        u"\U00002702-\U000027B0"
        u"\U000024C2-\U0001F251"
        "]+", flags=re.UNICODE
    )
    filename = emoji_pattern.sub('', filename)

    # 4. 연속 공백을 단일 공백으로
    filename = re.sub(r'\s+', ' ', filename)

    # 5. 앞뒤 공백 제거
    filename = filename.strip()

    # 6. 점(.)으로 시작하는 파일명 방지 (숨김 파일)
    if filename.startswith('.'):
        filename = filename[1:]

    # 7. 점(.)으로 끝나는 파일명 방지
    filename = filename.rstrip('.')

    # 8. 길이 제한 (확장자 포함 255자, .mp3 = 4자이므로 251자)
    max_length = 251
    if len(filename) > max_length:
        filename = filename[:max_length]

    # 9. 빈 파일명 방지
    if not filename:
        filename = "audio"

    return filename


def parse_cover_filename(youtube_title: str) -> str:
    """
    유튜브 제목에서 '곡명 (cover by. 아티스트)' 형식 추출 후 정리

    예시:
    - "IU - Blueming COVER by 원희 (ILLIT)" -> "Blueming (cover by. 원희)"
    - "Love Dive covered by NewJeans" -> "Love Dive (cover by. NewJeans)"

    Args:
        youtube_title: 유튜브 영상 제목

    Returns:
        파싱 및 정리된 파일명
    """
    # 패턴 매칭: 곡명 + cover/커버 키워드 + by + 아티스트
    patterns = [
        # "곡명 - 원곡가수 COVER by 아티스트" 형식
        r'^(?:[^\-]+\s*-\s*)?(.+?)\s*(?:cover|커버|COVER|Cover)\s*(?:by|BY|By)\s*(.+?)(?:\s*[\(\[].*?[\)\]]|$)',
        # "곡명 covered by 아티스트" 형식
        r'^(?:[^\-]+\s*-\s*)?(.+?)\s*(?:covered|커버드|COVERED)\s*(?:by|BY|By)\s*(.+?)(?:\s*[\(\[].*?[\)\]]|$)',
        # "곡명 (아티스트 cover)" 형식
        r'^(?:[^\-]+\s*-\s*)?(.+?)\s*[\(\[]\s*(.+?)\s*(?:cover|커버|COVER|Cover)\s*[\)\]]',
    ]

    for pattern in patterns:
        match = re.search(pattern, youtube_title, re.IGNORECASE)
        if match:
            song = match.group(1).strip()
            artist = match.group(2).strip()

            # 원곡 가수 제거 (하이픈 앞부분)
            song = re.sub(r'^[^\-]+-\s*', '', song).strip()

            # 괄호/대괄호 내용 제거
            song = re.sub(r'\s*[\(\[].*?[\)\]]', '', song).strip()
            artist = re.sub(r'\s*[\(\[].*?[\)\]]', '', artist).strip()

            # Official, MV 등 불필요한 단어 제거
            artist = re.sub(r'\s*(?:official|mv|video|audio|ver\.|ver|version)\s*', '', artist, flags=re.IGNORECASE).strip()

            filename = f"{song} (cover by. {artist})"

            # 자동 정리 적용
            return sanitize_filename(filename)

    # 파싱 실패 시 원본 제목 사용 (괄호 내용은 제거)
    cleaned_title = re.sub(r'\s*[\(\[].*?[\)\]]', '', youtube_title).strip()

    # 자동 정리 적용
    return sanitize_filename(cleaned_title)
