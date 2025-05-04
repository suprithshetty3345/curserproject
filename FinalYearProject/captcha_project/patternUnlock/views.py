from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.core import serializers

import random
import json
import numpy as np

class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return super(NpEncoder, self).default(obj)

def index(request):
    return render(request, 'patternUnlock/index.html')

## Compute adjacent elements for element at (i,j) position in matrix(2d array)
def findingNeighbors(two_d_array, i, j,graph) :
    rowLimit = len(two_d_array)-1
    columnLimit = len(two_d_array[0])-1

    for x in range(max(0,i-1),min(i+1,rowLimit)+1):
        for y in range(max(0,j-1), min(j+1,columnLimit)+1):
            if(x != i or y != j) :
                graph.setdefault(two_d_array[i][j], []).append(two_d_array[x][y])

def index(request):
    row = random.randint(2,5)
    column = random.randint(2,5)
    array = np.array(range(row*column)).reshape((row, column))
    graph = {}
    
    ## call the above function(findingNeighbors) for each matrix element
    for i in range(len(array)):
        for j in range(len(array[i])):
            findingNeighbors(array,i,j,graph)
  
    for i in range(1):
        total_numbers = row*column
        r = random.randint(0,(row*column)-1)
        visited = dfs(graph,r, [])
        json_pattern = json.dumps(visited, cls=NpEncoder)
    return render(request,'patternUnlock/index.html',{"pattern":json_pattern,"row":row,"column":column,"total_nos":total_numbers})


## DFS Algorithm to generate unique pattern
def dfs(graph, node, visited):
    random.shuffle(graph[node])
    if node not in visited:
        if len(visited)==0:
            visited.append(node)
        elif (node in graph[visited[-1]]):
            visited.append(node)
        for n in graph[node]:
            dfs(graph,n, visited)
    k = random.randint(4,9)
    return visited[:k]


# Homepage
def homepage(request):
    return render(request,'patternUnlock/index.html')

