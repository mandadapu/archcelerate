# Python hook script returning JSON
import json
import sys

# Hook logic here...

response = {
    "continue": True,  # Whether Claude should continue
    "feedback": "Code quality check passed",
    "modify_prompt": False
}

print(json.dumps(response))
