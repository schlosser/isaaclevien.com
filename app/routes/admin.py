from flask import Blueprint, render_template, abort, request, redirect, url_for
from flask.ext.login import login_required
from app import db
from app.forms import RecordingsForm, BioForm
from app.routes.helpers import _fetch_recordings, _fetch_bio
import requests
import re
SOUNDCLOUD_REGEX = r'^https?://[^/]*soundcloud\.com/[^ ]*$'

admin = Blueprint('admin', __name__, url_prefix='/admin')


@admin.route('/', methods=['GET'])
@login_required
def index():
    return redirect(url_for('.recordings'))


@admin.route('/recordings', methods=['GET'])
@login_required
def recordings():
    soundcloud_recordings = _fetch_recordings()
    soundcloud_urls = soundcloud_recordings.items.split(', ')
    form = RecordingsForm(soundcloud_urls=soundcloud_urls)
    return render_template('admin/recordings.html', form=form)


@admin.route('/recordings', methods=['POST'])
@login_required
def save_recordings():
    form = RecordingsForm()
    if form.validate_on_submit():
        soundcloud_recordings = _fetch_recordings()
        soundcloud_recordings.items = ', '.join(form.soundcloud_urls.data)
        db.session.add(soundcloud_recordings)
        db.session.commit()
        return "Saved!"
    abort(400)


@admin.route('/bio', methods=['GET'])
@login_required
def bio():
    bio = _fetch_bio()
    form = BioForm(short_bio=bio.short_bio, long_bio=bio.long_bio)
    return render_template('admin/bio.html', form=form)


@admin.route('/bio', methods=['POST'])
@login_required
def save_bio():
    form = BioForm()
    if form.validate_on_submit():
        bio = _fetch_bio()
        bio.short_bio = form.short_bio.data
        bio.long_bio = form.long_bio.data
        db.session.add(bio)
        db.session.commit()
        return "Saved!"
    abort(400)


@admin.route('/list_item/soundcloud')
@login_required
def soundcloud_item():
    soundcloud_url = _validate_soundcloud_url(request.args.get('url'))
    return render_template('includes/soundcloud_item.html', url=soundcloud_url)


def _validate_soundcloud_url(url):
    if not url:
        abort(400)

    if not re.match(SOUNDCLOUD_REGEX, url):
        abort(400)

    response = requests.head(url)
    if not response.ok:
        abort(400)

    return url
