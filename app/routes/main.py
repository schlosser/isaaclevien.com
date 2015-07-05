from flask import Blueprint, render_template
from app.routes.helpers import _fetch_recordings, _fetch_bio
import markdown

SOUNDCLOUD_REGEX = r'^https?://[^/]*soundcloud\.com/[^ ]*$'

main = Blueprint('main', __name__)


@main.route('/', methods=['GET'])
def index():
    bio = _fetch_bio()
    short_bio_html = markdown.markdown(bio.short_bio)
    return render_template('index.html', short_bio=short_bio_html)


@main.route('/about')
def about():
    bio = _fetch_bio()
    long_bio_html = markdown.markdown(bio.long_bio)
    return render_template('about.html', long_bio=long_bio_html)


@main.route('/recordings')
def view_recordings():
    recordings = _fetch_recordings()
    urls = recordings.items.split(', ')
    return render_template('recordings.html', urls=urls)
