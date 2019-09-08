from django.db import models

class Task(models.Model):
    title=models.CharField(max_length=20, null=False)
    comment=models.CharField(max_length=500, null=False)
    date_time =models.CharField(max_length=50,null=False)
    
    
    def __str__(self):
        return self.title

