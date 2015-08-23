import markdown
from datetime import datetime
from app import db
from flask.ext.login import UserMixin


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    email = db.Column(db.String(120), unique=True)
    password_hash = db.Column(db.String(80))

    def __init__(self, name, email, password_hash):
        self.name = name
        self.email = email
        self.password_hash = password_hash

    def __repr__(self):
        return '<User %r>' % self.name


class Recordings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    items = db.Column(db.Text)


class Bio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tagline = db.Column(db.String(200))
    short_bio = db.Column(db.Text)
    long_bio = db.Column(db.Text)
    bands = db.Column(db.Text)


class Gig(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date)
    time = db.Column(db.Time)
    location = db.Column(db.String(200))
    band = db.Column(db.String(200))
    details = db.Column(db.Text)

    def date_string(self):
        dt = datetime.combine(self.date, self.time)
        # Monday, 6/19 @ 8pm
        return (dt.strftime('%A, %m/%d @ %I:%M%p')
                .replace(' 0', ' ')
                .replace('/0', '/')
                .replace(':00', '')
                .replace('PM', 'pm')
                .replace('AM', 'am'))

    @property
    def details_html(self):
        return markdown.markdown(self.details)
