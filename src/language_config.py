"""Publication switch. Keep site_data.LANGS unchanged for translation indexes."""

PUBLISHED_LANGUAGES = ("fr", "en", "sv")
FALLBACK_LANGUAGE = "en"


def validate(all_languages):
    if not PUBLISHED_LANGUAGES or len(set(PUBLISHED_LANGUAGES)) != len(PUBLISHED_LANGUAGES):
        raise ValueError("Published languages must be nonempty and unique")
    if not set(PUBLISHED_LANGUAGES) <= set(all_languages):
        raise ValueError("Published language is missing translations")
    if FALLBACK_LANGUAGE not in PUBLISHED_LANGUAGES:
        raise ValueError("Fallback language must be published")
