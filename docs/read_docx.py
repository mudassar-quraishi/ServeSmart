import xml.etree.ElementTree as ET
import sys
sys.stdout.reconfigure(encoding='utf-8')
tree = ET.parse('c:/Users/mudas/OneDrive/Desktop/ServeSmart/docs/temp_docx/word/document.xml')
root = tree.getroot()
text = ''.join(node.text for node in root.iter() if node.text)
print(text)
