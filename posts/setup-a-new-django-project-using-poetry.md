---
title: Setting up a Django project with Poetry
date: '2021-04-13'
---

In this post, I’ll walk through setting up a new Django project with Poetry. I only
tested the following instructions on macOS, but you should be able to find the related
information for the OS you're using easily.

# What is Poetry

From [Poetry official site](https://python-poetry.org/docs/):
> Poetry is a tool
> for dependency management and packaging in Python. It allows you to declare the
> libraries your project depends on and it will manage (install/update) them for
> you.

# Installation

```
curl -sSL
https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py |
python -
```

# Create a new project using Poetry

Once you have Poetry installed, you can use it to create new python projects.
To create a new Python project assuming you have a `code/` folder in your home directory.

```shell
> cd ~/code/
> code poetry new a-python-project
Created package a_python_project in a-python-project
> cd a-python-project
> tree .
.
├── README.rst
├── a_python_project
│   └── __init__.py
├── pyproject.toml
└── tests
    ├── __init__.py
    └── test_a_python_project.py
> cat pyproject.toml
[tool.poetry]
name = "a-python-project"
version = "0.1.0"
description = ""
authors = ["Tianyi <hi@tianyi.dev>"]

[tool.poetry.dependencies]
python = "^3.9"

[tool.poetry.dev-dependencies]
pytest = "^5.2"

[build-system]
requires = ["poetry-core>=1.0.0"]
build-backend = "poetry.core.masonry.api"
```
As you can see, Poetry generates a `pyproject.toml` file and some other files for a
standard python project. You can check out what a `pyproject.toml`is here [PEP
518](https://www.python.org/dev/peps/pep-0518/).

Or you only poetry to generate a `pyproject.toml` file, you can initialize a project in a existing folder:

```shell
> cd ~/code/
> mkdir my-python-project
> cd my-python-project
> poetry init

This command will guide you through creating your pyproject.toml config.

Package name [my-python-project]:
Version [0.1.0]:
Description []:
Author [Tianyi <hi@tianyi.dev>, n to skip]:
License []:
Compatible Python versions [^3.9]:

Would you like to define your main dependencies interactively? (yes/no) [yes]
You can specify a package in the following forms:
  - A single name (requests)
  - A name and a constraint (requests@^2.23.0)
  - A git url (git+https://github.com/python-poetry/poetry.git)
  - A git url with a revision (git+https://github.com/python-poetry/poetry.git#develop)
  - A file path (../my-package/my-package.whl)
  - A directory (../my-package/)
  - A url (https://example.com/packages/my-package-0.1.0.tar.gz)

Search for package to add (or leave blank to continue):

Would you like to define your development dependencies interactively? (yes/no) [yes]
Search for package to add (or leave blank to continue):

Generated file

[tool.poetry]
name = "my-python-project"
version = "0.1.0"
description = ""
authors = ["Tianyi  <hi@tianyi.dev>"]

[tool.poetry.dependencies]
python = "^3.9"

[tool.poetry.dev-dependencies]

[build-system]
requires = ["poetry-core>=1.0.0"]
build-backend = "poetry.core.masonry.api"

Do you confirm generation? (yes/no) [yes]
```

The `pyproject.toml` file is used by poetry to manage our Python projects.

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
