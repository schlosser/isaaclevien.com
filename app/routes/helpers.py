from datetime import datetime
from flask import abort
from app.models import Recordings, Bio, Gig


def _fetch_recordings():
    all_recordings = Recordings.query.limit(1).all()
    if not all_recordings:
        abort(500)
    return all_recordings[0]


def _fetch_bio():
    all_bios = Bio.query.limit(1).all()
    if not all_bios:
        abort(500)
    return all_bios[0]


def _fetch_gigs():
    return (Gig.query
            .filter(Gig.date >= datetime.now().date())
            .order_by(Gig.date)
            .all())


def _fetch_upcoming_gigs():
    return (Gig.query
            .filter(Gig.date >= datetime.now().date())
            .order_by(Gig.date)
            .limit(3)
            .all())
