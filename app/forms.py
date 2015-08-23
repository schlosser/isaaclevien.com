from werkzeug.security import check_password_hash
from flask_wtf import Form
from wtforms import (StringField, PasswordField, FieldList, TextAreaField,
                     FormField)
from wtforms_components import TimeField, DateField
from wtforms.validators import DataRequired, Email, ValidationError, URL
from app.models import User
from datetime import datetime

ERROR_MSG = 'Bad email / password combination'


def valid_password(form, field):
    """A validator that ensures that there is an image in the database with the
    filename that is the same as the field's data.
    :param form: The parent form
    :type form: :class:`Form`
    :param field: The field to validate
    :type field: :class:`Field`
    """
    user = User.query.filter_by(email=form.email.data).first()
    if not user:
        raise ValidationError(ERROR_MSG)
    if not check_password_hash(user.password_hash, field.data):
        raise ValidationError(ERROR_MSG)


def valid_datetime(form, field):
    """A validator that checks that a date is at least the current date.
    :param form: The parent form
    :type form: :class:`Form`
    :param field: The field to validate
    :type field: :class:`Field`
    """
    date = datetime.combine(form.date.data, form.time.data)
    if date <= datetime.now():
        raise ValidationError('Gig date must be in the future.')


class LoginForm(Form):
    email = StringField('email',
                        validators=[DataRequired(), Email()])
    password = PasswordField('password',
                             validators=[DataRequired(), valid_password])


class RecordingsForm(Form):
    soundcloud_urls = FieldList(
        StringField('soundcloud_url', validators=[URL(), DataRequired()]))


class BioForm(Form):
    tagline = StringField()
    short_bio = TextAreaField()
    long_bio = TextAreaField()


class GigForm(Form):
    date = DateField('Date', validators=[DataRequired(), valid_datetime])
    time = TimeField('Time', validators=[DataRequired()])
    location = StringField('Location', validators=[DataRequired()])
    band = StringField('Band', validators=[DataRequired()])
    details = TextAreaField('Details')


class GigsForm(Form):
    gigs = FieldList(FormField(GigForm))
    new_gig = FormField(GigForm)
