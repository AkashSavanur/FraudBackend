import sys
import cv2
import numpy as np
import pytesseract
from PIL import Image
import openai

# Set OpenAI API key
openai.api_key = "API"

def get_string(img_path):
    # Read image with OpenCV
    img = cv2.imread(img_path)

    # Check if image is loaded properly
    if img is None:
        return "Error: Could not open or find the image."

    # Convert image to grayscale
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Apply dilation and erosion to remove noise
    kernel = np.ones((1, 1), np.uint8)
    img = cv2.dilate(img, kernel, iterations=1)
    img = cv2.erode(img, kernel, iterations=1)

    # Apply threshold
    img = cv2.adaptiveThreshold(img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 2)

    # Recognize text with Tesseract OCR
    result = pytesseract.image_to_string(img)
    return result

def answer_question(question, extracted_text):
    """
    Answer a question using GPT-4 based on extracted text from the image
    """
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "Use the following extracted text to answer the user's question."},
            {"role": "user", "content": extracted_text},
            {"role": "user", "content": question},
        ],
        max_tokens=150,
        temperature=0,
    )
    return response['choices'][0]['message']['content'].strip()

if __name__ == "__main__":
    # Get the file path and question from the command line arguments
    if len(sys.argv) < 3:
        print("Error: Image file path and question required")
        sys.exit(1)

    image_path = sys.argv[1]
    question = sys.argv[2]

    # Extract text from the image
    extracted_text = get_string(image_path)

    if extracted_text:
        # Answer the question using GPT-4
        gpt_answer = answer_question(question, extracted_text)
        print(f"Extracted Text:\n{extracted_text}\n")
        print(f"GPT-4 Answer:\n{gpt_answer}")
    else:
        print("No text recognized or error in processing.")
