---
title: Set up a Django project using Poetry
date: '2020-12-18'
---

# What is Poetry

From [Poetry official site](https://python-poetry.org/docs/): Poetry is a tool
for dependency management and packaging in Python. It allows you to declare the
libraries your project depends on and it will manage (install/update) them for
you.

# Installation

```
curl -sSL
https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py |
python -
```

# Create a new project using Poetry

```
poetry new new-django-project
```

# Add Django Dependency

```
poetry add django
```

# Activate the virtualenv using Poetry


```
poetry shell
```

# Create the new Django project using `django-admin` command

```
django-admin startproject my-site
```

# Start the Django project using the `manage.py` command

```sh
cd my-site
python manage.py runserver
```

Viola, now we have a Django project setup using Poetry.
