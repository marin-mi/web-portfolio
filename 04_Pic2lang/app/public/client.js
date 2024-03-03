const uploadInput = document.getElementById('upload-input');
const previewImage = document.getElementById('preview-image');
const recognizeTextButton = document.getElementById('recognize-text-button');
const recognizeTextLoader = document.getElementById("recognize-text-loader");
const recognizedProgress = document.getElementById("recognized-progress");
const recognizedText = document.getElementById("recognized-text");
const languageSelect = document.getElementById("language-select" );
const translateButton = document.getElementById("translate-button");
const translateTextLoader = document.getElementById("translate-text-loader");
const translatedText = document.getElementById("translated-text");
const saveButton = document.getElementById("save-button" );
const translatedDataList = document.getElementById("translated-data-list");

uploadInput. addEventListener ("change", uploadPicture); 
recognizeTextButton.addEventListener ("click", recognizeContent); 
translateButton. addEventListener ("click", translateText); 
saveButton. addEventListener ("click", saveTranslatedData); 
recognizedText. addEventListener ("change", enableTranslateButton); 
recognizedText.addEventListener ("keyup", enableTranslateButton); 
window. addEventListener ("load", displayTranslatedData);

function enableTranslateButton() {
    translateButton.disabled = recognizedText.value === "";
}

function uploadPicture() {
    const file = uploadInput.files[0];
    recognizedProgress.value = 0;
    if (file) {
        const reader = new FileReader ();
        reader.onload = (e) => { 
            previewImage.src = e.target.result;
            previewImage.style.display = "block";
            recognizeTextButton.disabled = false;
        };
    reader.readAsDataURL(file);
    } else {
        previewImage.src = "";
        previewImage.style.display = "none" ;
        recognizeTextButton.disabled = true;
    }
}
function recognizeContent() {
    Tesseract.recognize(previewImage.src, "jpn+eng+chi_tra", {
        logger: (log) => {
            recognizeTextLoader.style.display = "inline-block";
            if (log.status === "recognizing text") {
                recognizedProgress.value = Math.floor(log.progress * 100);
            }
        },
    }).then(({ data }) => {
        recognizeTextLoader.style.display = "none";
        recognizedText.value = data.text;
        enableTranslateButton();
    });
}

async function translateText(){
    translateTextLoader.style.display = "inline-block";
        const response = await fetch("/api/translate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: recognizedText.value, 
                targetLang: languageSelect.value,
            }),
        });
        const data = await response.json();

        translateTextLoader.style.display = "none" ;
        translatedText.value = data.text;
}

const dbVersion = 1;
const dbName = "ocrTranslation";
const storeName = "translatedData";
        
function openIndexedDB() {
    return new Promise ((resolve, reject) => {
        const openRequest = indexedDB.open(dbName, dbVersion);

        openRequest.onerror = (event) => {
            reject (event.target.error);
        };

        openRequest.onsuccess = (event) => {
            resolve (event.target.result);
        };

        openRequest. onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
            }
        };
    });
}

async function displayTranslatedData() {
    try {
        const db = await openIndexedDB();
        const transaction = db.transaction(storeName, "readonly");
        const objectStore = transaction.objectStore(storeName);
        const getAllRequest = objectStore.getAll();

        const translatedData = await new Promise ((resolve, reject) => {
            getAllRequest. onsuccess = (event) => {
                resolve (event.target.result);
            };
            getAllRequest.onerror = (event) => {
                reject (event.target.error);
                };
            });

            translatedDataList.innerHTML = "";
            translatedData.forEach((item) => {
                const row = document.createElement("tr");

                const imageCell = document.createElement("td");
                const imageElement = document.createElement ("img");
                imageElement.src = URL.createObjectURL(item.image);
                imageElement.style.maxWidth = "240px";
                imageCell.appendChild(imageElement);
                row.appendChild(imageCell);

                const originalTextCell = document.createElement("td");
                originalTextCell.textContent = item.originalText;
                row.appendChild(originalTextCell);

                const translatedTextCell = document.createElement("td");
                translatedTextCell.textContent = item.translatedText;
                row.appendChild(translatedTextCell);

                const dateCell = document.createElement("td");
                dateCell.textContent = item.date.toLocaleString("ja-JP", {
                    timeZone: "Asia/Tokyo",
                });
                row.appendChild(dateCell);

                const deleteCell = document.createElement("td");
                const deleteButton = document.createElement("button");
                deleteButton.className = "btn btn-danger btn-sm";
                deleteButton.textContent = "削除";
                deleteButton.addEventListener("click", () => { 
                    deleteTranslatedData(item.id);
                });
                deleteCell.appendChild(deleteButton); 
                row.appendChild(deleteCell);

                translatedDataList.appendChild(row);
            });
        } catch (err) {
            console.error(err);
        }
    }

async function saveTranslatedData(){
    try {
        const image = await fetch(previewImage.src);
        const imageBlob = await image.blob();

        const db = await openIndexedDB();
        const transaction = db.transaction(storeName, "readwrite");
        const objectStore = transaction.objectStore(storeName);

        transaction.onerror = (error) => {
            console.error("Transaction error:", error);
        };

        const addRequest = objectStore.add({
            originalText: recognizedText.value, 
            translatedText: translatedText.value, 
            image: imageBlob, 
            date: new Date(),
        });

        addRequest.onerror = (error) => {
            console.error ("Error adding data to IndexedDB:", error);
        };

        transaction. oncomplete = () => {
            displayTranslatedData(); 
            db.close();
        };
    } catch (err) {
        console.error(err);
    }
}
        
async function deleteTranslatedData(id) {
    try {
        const db = await openIndexedDB();
        const transaction = db.transaction(storeName, "readwrite");
        const objectStore = transaction.objectStore(storeName);

        const deleteRequest = objectStore.delete(id);

        deleteRequest.onerror = (event) => {
            console.error ("Error deleting data from IndexedDB:", event.target.error);
        };
        
        transaction.oncomplete = () => {
            displayTranslatedData(); 
            db.close();
        };
    } catch (err) {
        console.error(err);
    }
}