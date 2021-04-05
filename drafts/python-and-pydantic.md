---
title: Python and Pydantic
date:  2021-03-30
---

In this article, we'll take a look at how to integrate Pydantic with a Django
application using the Pydantic-Django and Django Ninja packages.

## Pydantic

Pydantic is a Python package for data validation and settings management that's based on
Python type hints. It enforces type hints at runtime, provides user-friendly errors,
allows custom data types, and works well with many popular IDEs. It's extremely fast
and easy to use as well!

Let's look at an example:

```python
from pydantic import BaseModel

class Song(BaseModel):
    id: int
	name: str
```

Here, we defined a `Song` model with two attributes, both of which are required:
1. `id` is an integer
2. `name` is a string

Validation then happens on initialization:
```shell
>>> song = Song(id=1, name='I can almost see you')
>> song.name
'I can almost see you'

>> Song(id='1')
pydantic.error_wrappers.ValidationError: 1 validation error for Song
name
  field required (type=value_error.missing)

>>> Song(id='foo', name='I can almost see you')
pydantic.error_wrappers.ValidationError: 1 validation error for Song
id
  value is not a valid integer (type=type_error.integer)
```

> To learn more about Pydantic, be sure to read the Overview page from the official doc

## Pydantic and Django

When coupled with Django, we can use Pydantic to ensure that only data that matches the
defined schemas are used in our application. So, we'll define schemas for validating
requests and responses, and when a validation error occurs, we'll simply return a nice
user friendly error message.

While you  can integrate Pydantic with Django without any third party packages, we'll
simplify the process by leveraging the following packages:

1. Pydantic-Django - Adds Pydantic support for validating model data
2. Django Ninja - along with Pydantic, this package gives you a number of additional
   bells and whistles, like auto-generated API documentation (via OpenAPI and JSON
   Schema), serialization, and API versioning.

> Django Ninja is heavily inspired by FastAPI. Check it out if you like FastAPI but
   still want to leverage much of what Django has to offer.

## Pydantic-Django

Now that you have a basic idea of what Pydantic is, let's take a look at a practical
example. We'll create a simple RESTful API, with Django and Pydantic-Django, that allows
us to fetch, list and create articles.

## Basic Setup

Start by setting up a new Django project:

```shell
$ mkdir django-with-pydantic && cd django-with-pydantic
$ python3.9 -m venv env
$ source env/bin/activate

(env)$ pip install django==3.1.5
(env)$ django-admin.py startproject core .
```

After that, create a new app called `blog`:

```shell
(env)$ python manage.py startapp blog
```

Register the app in core/settings.py under `INSTALLED_APPS`:

```python
# core/settings.py

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'blog.apps.BlogConfig', # new
]
```

## Create Database Models

Next, let's create an `Article` model.

Add the following to `blog/models.py`:

```python
# blog/models.py

from django.contrib.auth.models import User
from django.db import models


class Article(models.Model):
    author = models.ForeignKey(to=User, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=512, unique=True)
    content = models.TextField()

    def __str__(self):
        return f'{self.author.username}: {self.title}'
```

Create then apply the migrations:

```shell
(env)$ python manage.py makemigrations
(env)$ python manage.py migrate
```

Register the model in blog/admin.py so it's accessible from the Django admin panel:

```shell
# blog/admin.py

from django.contrib import admin

from blog.models import Article


admin.site.register(Article)
```

## Install Pydantic-Django and Create the Schemas

Install Pydantic and Pydantic-Django:

```shell
(env)$ pip install pydantic==1.7.3 pydantic-django==0.0.7
```

Now, we can define a schema, which will be used to-
1. Validate the fields from a request payload, and then use the data to create new model objects.
2. Retrieve and validate model objects for response objects.

Create a new file called `blog/schemas.py`

```python
# blog/schemas.py

from pydantic_django import ModelSchema

from blog.models import Article


class ArticleSchema(ModelSchema):
    class Config:
        model = Article
```

This is the simplest possible schema, which drives from our model.

> Django modes need to be loaded before schemas, so the schemas must live in a separate
> file in order to avoid model loading errors.

With schemas, you can also define which fields should and shouldn't be included from
particular model by passing `exclude` or `include` to the `Config`. For example, to
exclude `author`:

```python
lass ArticleSchema(ModelSchema):
    class Config:
        model = Article
        exclude = ['author']

# or

class ArticleSchema(ModelSchema):
    class Config:
        model = Article
        include = ['created', 'title', 'content']
```

You can also use schemas to override Django model properties by changing the fields
inside the schema. For example:

```python
class ArtcleSchema(ModelSchema):
    title: Optional[str]

    class Config:
	    model = Article
```

## Views and URLs

Next, let's set up the following endpoints:

1. /blog/articles/create/ creates a new article
2. /blog/articles/<ARTICLE_ID/ fetches a single article
3. /blog/articles/ lists all articles

Add the following views to blog/views.py:

```python
# blog/views.py

from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from blog.models import Article
from blog.schemas import ArticleSchema

@csrf_exempt  # testing purposes; you should always pass your CSRF token with your POST requests (+ authentication)
@require_http_methods('POST')
def create_article(request):
    try:
        json_data = json.loads(request.body)

        # fetch the user and pass it to schema
        author = User.objects.get(id=json_data['author'])
        schema = ArticleSchema.create(
            author=author,
            title=json_data['title'],
            content=json_data['content']
        )
        return JsonResponse({
            'article': schema.dict()
        })
    except User.DoesNotExist:
        return JsonResponse({'detail': 'Cannot find a user with this id.'}, status=404)

def get_article(request, article_id):
    try:
        article = Article.objects.get(id=article_id)
        schema = ArticleSchema.from_django(article)
        return JsonResponse({
            'article': schema.dict()
        })
    except Article.DoesNotExist:
        return JsonResponse({'detail': 'Cannot find an article with this id.'},
		status=404)

def get_all_articles(request):
    articles = Article.objects.all()
    data = []

    for article in articles:
        schema = ArticleSchema.from_django(article)
        data.append(schema.dict())

    return JsonResponse({
        'articles': data
    })
```

Take note of t he areas in which we're using the schema, `ArticleSchema`:

1. `ArticleSchema.create()` creates a new `Article` object.
2. `schema.dict()` returns a dictionary of the fields and values that we passed to
   `JsonResponse`
3. `ArtcileSchema.from_django()` generates a schema from an `Article` object

> Remember: Both create() and from_django() will also validate data against the schema.

Add a urls.py file to "blog", and define the following URLs:

```python
 blog/urls.py

from django.urls import path

from blog import views

urlpatterns = [
    path('articles/create/', views.create_article),
    path('articles/<str:article_id>/', views.get_article),
    path('articles/', views.get_all_articles),
]
```

Now, let's register our app URLs to the base project:

```python
# core/urls.py

from django.contrib import admin
from django.shortcuts import render
from django.urls import path, include  # new import


urlpatterns = [
    path('admin/', admin.site.urls),
    path('blog/', include('blog.urls')),  # new
]
```

## Sanity Check

To test, first create a superuser:

```shell
(env)$ python manage.py createsuperuser
```

Then, run the development server:

```shell
(env)$ python manage.py runserver
```

In a new terminal window, add a new article with cURL:
```shell
$ curl --header "Content-Type: application/json" --request POST \
  --data '{"author":"1","title":"Something Interesting", "content":"Really interesting."}' \
  http://localhost:8000/blog/articles/create/
```

You should see something like:
```json
{
    "article": {
        "id": 1,
        "author": 1,
        "created": "2021-02-01T20:01:35.904Z",
        "title": "Something Interesting",
        "content": "Really interesting."
    }
}
```

You should then able to view the article at `http://127.0.0.1:8000/blog/articles/1/` and `http://127.0.0.1:8000/blog/artciles/`

## Response Schema

Want to remove the `created` field from the response for all articles?

Add a new schema to `blog/schemas.py`:

```python
class ArticleResposneSchema(ModelSchema):
    class config:
	    model = Article
		exclude = ['created']
```

Then, update the view:
```python
def get_all_articles(request):
    articles = Article.objects.all()
    data = []

    for article in articles:
        schema = ArticleResponseSchema.from_django(article)
        data.append(schema.dict())

    return JsonResponse({
        'articles': data
    })
```

Don't forget to add the import:

```python
from blog.schemas import ArticleSchema, ArticleResponseSchema
```

Test it out at `http://127.0.0.1:8000/blog/articles/`

## Django Ninja

[Django Ninja](https://github.com/vitalik/django-ninja) is a tool for building APIs with
Django and Python based type hints. As mentioned, it comes with a number of powerful
features. It's "fast to learn, fast to code, fast to run".

### Basic Setup

Create a new Django project:

```shell
$ mkdir django-with-ninja && cd django-with-ninja
$ python3.9 -m venv env
$ source env/bin/activate

(env)$ pip install django==3.1.5
(env)$ django-admin.py startproject core .
```

Create a new app called `blog`:

```shell
(env)$ python manage.py startapp blog
```

Register the app in `core/settings.py` under `INSTALLED_APPS`:

```python
# core/settings.py

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'blog.apps.BlogConfig', # new
]
```

### Create Database Models

Next, add an `Article` model to `blog/models.py`:

```python
 blog/models.py

from django.contrib.auth.models import User
from django.db import models


class Article(models.Model):
    author = models.ForeignKey(to=User, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=512, unique=True)
    content = models.TextField()

    def __str__(self):
        return f'{self.author.username}: {self.title}'
```

Create and apply the migrations:

```shell
(env)$ python manage.py makemigrations
(env)$ python manage.py migrate
```

Register the model in `blog/admin.py`:

```python
# blog/admin.py

from django.contrib import admin
from blog.models import Article


admin.site.register(Article)
```

### Install Djagno Ninja and Create the Schemas

Install:

```shell
(env)$ pip install django-ninja==0.10.1
```

Like with `Pytdantic-Django`, you need to create schemas to validate your requests and
responses. That said, auto-schema generation from Django models looks to be coming at
some point.

> For more on auto-schema generation support, review the Models to Schemas proposal.

Add the following to `blog/schemas.py`

```python
from datetime import datetime

from ninja import Schema


class UserSchema(Schema):
    id: int
    username: str


class ArticleIn(Schema):
    author: int
    title: str
    content: str


class ArticleOut(Schema):
    id: int
    author: UserSchema
    created: datetime
    title: str
    content: str
```

Here, we created three different schemas:
1. `UserSchema` validates and converts data to/from the Django user model
2. `ArticleIn` validates and de-serializes data passed to the API for creating articles
3. `ArticleOut` validates and serializes data from the `Article` model

Django Ninja has a concept of a router, which used split up an API into multiple
modules.

Create a `blog/api.py` file:

```python
# blog/api.py

from typing import List

from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from ninja import Router

from blog.models import Article
from blog.schemas import ArticleOut, ArticleIn

router = Router()


@router.post('/articles/create')
def create_article(request, payload: ArticleIn):
    data = payload.dict()
    try:
        author = User.objects.get(id=data['author'])
        del data['author']
        article = Article.objects.create(author=author, **data)
        return {
            'detail': 'Article has been successfully created.',
            'id': article.id,
        }
    except User.DoesNotExist:
        return {'detail': 'The specific user cannot be found.'}


@router.get('/articles/{article_id}', response=ArticleOut)
def get_article(request, article_id: int):
    article = get_object_or_404(Article, id=article_id)
    return article


@router.get('/articles', response=List[ArticleOut])
def get_articles(request):
    articles = Article.objects.all()
    return articles
```

Here, we created three functions which serve as our views. Django Ninja uses HTTP
operation decorators where you define the URL structure, path parameters, and optional
request and response schemas.

Notes:

1. `get_article` uses `ArticleOut` for its response schema. `ArticleOut` will thus be
   used to validate and serialize data from the model automatically.
2. In `get_articles`, the Django queryset -- eg., `articles = Article.objects.all()` --
   will be validated properly with List[ArticleOut].

### Register API Endpoints

The last thing we have to do is to create a new instance of `NinjaAPI` and register our
API router in `core/urls.py`

```python
core/urls.py

from django.contrib import admin
from django.urls import path
from ninja import NinjaAPI
from blog.api import router as blog_router

api = NinjaAPI()
api.add_router('/blog/', blog_router)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api.urls),
]
```

With that, Django Ninja will automatically create the following endpoints:

1. `/blog/articles/create/` creates a new article
2. `blog/articles/<ARTICLE_ID>/` fetches a single article
3. `/blog/articles/` lists all articles

### Sanity Check

Create a superuser, and then run the development server:

```shell
(env)$ python manage.py createsuperuser
(env)$ python manage.py runserver
```

Navigate to `http://localhost:8000/api/docs` to view the auto-generated interactive API
documentation:

![Ninja API swagger screenshot-one](https://screenshot-one)

Here, you can see an interact with the registered endpoints.

Try adding a new article:

![Ninja API swagger screenshot-two](https://screenshot-two)

Try the remaining endpoints on your own.

## Conclusion

In this article, we first looked at what Pydantic is and then we looked at the how to
integrate it with a Django application using Pydantic-Django and Django Ninja.

Both packages are currently in active development. Just keep in mind that while both
packages are immature, Pydantic-Django is still an experimental phase (as of writing),
so use it with caution.

You can grab the full code on GitHub:
1. django-with-pydantic
2. django-with-ninja
