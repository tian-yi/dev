---
title: Where to put business login in a Django project
date: '2021-05-20'
---

ref: https://www.reddit.com/r/django/comments/nghi9h/where_should_i_put_the_logic/

## What is a service layer
What is a service layer. It's a layer between Django models and views.

## What does service layer do
It only contains business logic.
View layer to display:
Model layer to store data:
Service layer to connect View and Model.
View <-> Service <-> Model

copy the note from Notion and do some more research to write a more articulated post.

Can also mention why not putting too much logic in the model layer. It's not because we
might need to change ORM. It's more about not creating data dependencies like the God
object(User, Customer etc.)

So this way, it's easier to scale out. If we build a modular monolith from day 1, we can
easily transit to micro services in day 1000.
