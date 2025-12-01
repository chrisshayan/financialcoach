#!/bin/bash
# Installation script with Python version check and compatibility workaround

echo "Checking Python version..."
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
echo "Python version: $PYTHON_VERSION"

if [[ $(echo "$PYTHON_VERSION >= 3.13" | bc -l 2>/dev/null) -eq 1 ]] || [[ "$PYTHON_VERSION" == "3.13"* ]]; then
    echo "Warning: Python 3.13 detected. Some dependencies may need compatibility mode."
    echo "Setting PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1..."
    export PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1
fi

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Installation complete!"

