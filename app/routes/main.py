from flask import Blueprint, render_template
from app.routes.helpers import (_fetch_recordings, _fetch_bio, _fetch_gigs,
                                _fetch_upcoming_gigs)
import markdown

SOUNDCLOUD_REGEX = r'^https?://[^/]*soundcloud\.com/[^ ]*$'

main = Blueprint('main', __name__)


@main.route('/', methods=['GET'])
def index():
    bio = _fetch_bio()
    gigs = _fetch_upcoming_gigs()
    short_bio_html = markdown.markdown(bio.short_bio)
    return render_template('index.html',
                           gigs=gigs,
                           tagline=bio.tagline,
                           short_bio=short_bio_html)


@main.route('/about')
def about():
    bio = _fetch_bio()
    long_bio_html = markdown.markdown(bio.long_bio)
    return render_template('about.html',
                           tagline=bio.tagline,
                           long_bio=long_bio_html)


@main.route('/gigs')
def gigs():
    bio = _fetch_bio()
    gigs = _fetch_gigs()
    return render_template('gigs.html',
                           gigs=gigs,
                           tagline=bio.tagline)


@main.route('/bands')
def bands():
    bio = _fetch_bio()
    bands_html = markdown.markdown(bio.bands)
    return render_template('bands.html',
                           tagline=bio.tagline,
                           bands=bands_html)


@main.route('/music')
def music():
    bio = _fetch_bio()
    recordings = _fetch_recordings()
    urls = recordings.items.split(', ')
    return render_template('music.html',
                           tagline=bio.tagline,
                           urls=urls)
