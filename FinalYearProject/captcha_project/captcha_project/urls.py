# """captcha_project URL Configuration

# The `urlpatterns` list routes URLs to views. For more information please see:
#     https://docs.djangoproject.com/en/3.0/topics/http/urls/
# Examples:
# Function views
#     1. Add an import:  from my_app import views
#     2. Add a URL to urlpatterns:  path('', views.home, name='home')
# Class-based views
#     1. Add an import:  from other_app.views import Home
#     2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
# Including another URLconf
#     1. Import the include() function: from django.urls import include, path
#     2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
# """
# from django.contrib import admin
# from django.urls import path, include

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('patternUnlock/',include('patternUnlock.urls'))
# ]


# from django.contrib import admin
# from django.urls import path, include
# from django.http import HttpResponseRedirect

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('patternUnlock/', include('patternUnlock.urls')),  # Include app URLs
#     path('', lambda request: HttpResponseRedirect('/patternUnlock/')),  # Redirect root to app
# ]

from django.contrib import admin
from django.urls import path, include
from patternUnlock import views  # Import views from the app

urlpatterns = [
    path('admin/', admin.site.urls),
    path('patternUnlock/', include('patternUnlock.urls')),  # Include app URLs
    path('', views.index, name='home'),  # Root URL points to the index view
]

