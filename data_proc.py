import os
import json
import random

path = "./data"

result = []
for root,d_names,f_names in os.walk(path):
    for f in f_names:
        result.append({"name" : os.path.basename(root), "url": os.path.join(root, f)})

print(len(result))
random.shuffle(result)

with open('breadURLs.json', 'w') as outfile:
    json.dump(result, outfile)

print("Finished processing json")