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
    short_bio = db.Column(db.Text)
    long_bio = db.Column(db.Text)
