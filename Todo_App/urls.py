from django.urls import path
from . import views
from django.contrib.auth import views as auth_views


urlpatterns = [
    path('', views.index, name='index'),
    path('save_tasks', views.save_tasks, name='save_tasks'),
    path('retrieve_tasks', views.retrieve_tasks, name='retrieve_tasks'),
    path('delete_task', views.delete_task, name='delete_task'),
    path('update_tasks', views.update_tasks, name='update_tasks'),
]