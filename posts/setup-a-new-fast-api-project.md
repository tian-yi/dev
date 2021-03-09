---
title: Where to put business logic in Django
date: '2021-03-08'
---

## The Problem

Django is an MVC framework, though it says it's more of a MTV. But the view
layer in Django is more of the controller in the MVC sense. Django does not
enforce you to put the business logic code in a certain place, at the end of
the day, it's just python with some conventions. Because oft this, when a
Django project start to grow big, developers tend to put business logic at
different places, cause inconsitency in the code base, and in the long time to
make it hard to understand the code base and also extend the functionalities.
There are a couple of layers from the MTV we can put the business logic in. One
is the model, one is the view. But both have problems. let's see the problems
with each approach.

### Business logics in the models (Fat models)

Our code base follows some sort of fat model convention. Meaning adding as many methods on the model. Fat model suits at early stage of a Django project, but when the project grows there're a few problems:

- **Fat models create a lot of dependencies overtime**
    - Because most of “business logic” involves interacting with other models. It creates unnecessary dependencies especially for the models that are part of the core of your application.
    - Coupling those components like this forces you to change your code if any change happens on other models such as a method signature or a side effect that was added into it.
- **Fat models are hard to test**
    - Testing model will either involves a lot of mocking or importing other models.

- ***Fat models violate the Single Responsibility Principle (SRP)***
    - Fat Models make you to add more responsibility to a particular class. Frequently we add methods to send emails and notifications to the model. The responsibility of a model is to handle the data, not to send emails or notifications.
- ***Fat models make you lazy***
    - It's *just too easy* to add another method on the model to facilitate your what we're doing.

### Business logics in the Views

Views should be responsible to take a request and return a response. When there's too much logic in there, it becomes hard to test.

## Proposed solution

A service layer, Why?

### Discussion on the Django forum

[https://forum.djangoproject.com/t/where-to-put-business-logic-in-django/282](https://forum.djangoproject.com/t/where-to-put-business-logic-in-django/282)

From Andrew Godwin who's the core contributor of Django, worked on the ORM and async stuff.

> I’ve also used the “services” type approach - basically a “fat model layer” but not in the model layer - with quite a bit of success. You have to make sure you keep good separation, but that tends to be easier with them pulled out like that.
At my current work we have a full-blown [micro]services infrastructure, which is less recommended unless you’re big enough to maintain something that size.

This is the one I am trying to do for our current code base.

### Some community Django Style guides

- [https://github.com/phalt/django-api-domains/](https://github.com/phalt/django-api-domains/)
- [https://github.com/HackSoftware/Django-Styleguide](https://github.com/HackSoftware/Django-Styleguide)

### First attempt at it:


### Why against service layer (But no really our use case)

- [https://www.b-list.org/weblog/2020/mar/16/no-service/](https://www.b-list.org/weblog/2020/mar/16/no-service/)

## Inspiration/ Reference

[http://www.cosmicpython.com/book/introduction.html](http://www.cosmicpython.com/book/introduction.html)

[http://www.cosmicpython.com/book/appendix_ds1_table.html](http://www.cosmicpython.com/book/appendix_ds1_table.html)


TODO: Try to explain each problems more elaborately. Use a coding example for each case.
