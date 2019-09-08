from django.shortcuts import render, HttpResponse
from Todo_App.models import Task
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
import json


@login_required
def index(request):
    return render(request, 'Todo_App/index.html')


def save_tasks(request):
    if request.method == "POST":
        title = request.POST['task']
        comment = request.POST['comment']
        date = request.POST['date_time']
        new_Task = Task(title=title, comment=comment, date_time=date)
        new_Task.save()
        task_list = Task.objects.last().id
        return JsonResponse({'id':task_list}, safe=False)


def retrieve_tasks(request):
    if request.method == "GET":
        task_list = list(Task.objects.values())
        return JsonResponse(task_list, safe=False)


def delete_task(request):
    if request.method == "POST":
        task_id = int(request.POST.get('id'))
        task_to_delete=Task.objects.get(id=task_id)
        # print(task_to_delete)
        task_to_delete.delete()
        return JsonResponse(str(task_id)+ " was removed",safe=False)

def update_tasks(request):
        if request.method == "POST":
                myid = request.POST['id']
                title=request.POST['task']
                comment=request.POST['comment']
                Task.objects.filter(id=myid).update(title=title,comment=comment)
                return JsonResponse(str(myid)+ " was updated,",safe=False)