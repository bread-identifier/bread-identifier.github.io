import json
import random
from pathlib import Path

with open('breadURLs.json', 'r') as f:
    breads = json.load(f)

results = []

for bread in breads:
    my_file = Path(bread["url"])
    if my_file.is_file():
        results.append(bread)

random.shuffle(results)

with open('breadURLs.json', 'w') as outfile:
    json.dump(results, outfile)

print("Finished processing json")