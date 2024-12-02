const apiUrl = "http://localhost:5000/api"; // Your API URL
const studentId = JSON.parse(localStorage.getItem("currentUser")).id; // Get student ID from localStorage

// Fetch and render subjects and exams
async function fetchSubjects() {
    try {
        const response = await fetch(`${apiUrl}/exams`);
        let exams = await response.json();
        exams = exams.exams;
        console.log(exams);

        // Clear the container
        const subjectsContainer = document.getElementById("subjects-container");
        subjectsContainer.innerHTML = "";

        // Loop through each exam
        exams.forEach(async exam => {
            const subjectBlock = document.createElement("div");
            subjectBlock.className = "subject-container";
            subjectBlock.innerHTML = `
                <h4>Subject: ${exam.subject_id}</h4>
                <div id="exams-${exam.id}">
                    <p><strong>Exam Name:</strong> ${exam.name}</p>
                    <p><strong>Date:</strong> ${exam.date}</p>
                    <p><strong>Duration:</strong> ${exam.duration} minutes</p>
                    <p><strong>Total Marks:</strong> ${exam.total_marks}</p>
                    <div id="exam-action-${exam.id}"></div>
                </div>
            `;

            // Check eligibility to enter the exam or show grade
            const actionBlock = subjectBlock.querySelector(`#exam-action-${exam.id}`);
            await checkStudentEligibility(exam, actionBlock);

            subjectsContainer.appendChild(subjectBlock);
        });
    } catch (error) {
        console.error("Error fetching exams:", error);
        alert("Error loading exams.");
    }
}

// Check if the student can enter the exam or show their grade
async function checkStudentEligibility(exam, actionBlock) {
    try {
        console.log("Checking eligibility for exam:", exam);

        // Fix grades and entered IDs to be valid JSON
        const grades = exam.grades ? parseCustomData(exam.grades) : {};
        const enteredIds = exam.entredID ? parseCustomData(exam.entredID) : [];

        console.log("Grades:", grades);
        console.log("Entered IDs:", enteredIds);

        // Check if the student has entered the exam
        if (enteredIds.includes(studentId)) {
            if (grades[studentId] !== undefined) {
                // Show grade if the student has already taken the exam
                actionBlock.innerHTML = `
                    <p>Your Grade: ${grades[studentId]}</p>
                    <button class="btn btn-info btn-grade" disabled>Grade View</button>
                `;
            } else {
                // The student has entered but hasn't been graded yet
                actionBlock.innerHTML = `
                    <p>You have entered this exam, but grades are not available yet.</p>
                `;
            }
        } else {
            // Allow student to enter the exam if they haven't entered it yet
            actionBlock.innerHTML = `
                <button class="btn btn-primary btn-enter" onclick="enterExam(${exam.id})">Enter Exam</button>
            `;
        }
    } catch (error) {
        console.error("Error checking exam eligibility:", error);
        alert("Error checking exam eligibility.");
    }
}

// Utility function to parse custom formatted data
function parseCustomData(data) {
    // Replace semicolons with commas and remove braces if necessary
    let cleanedData = data.replace(/[{};]/g, '').split(';').filter(item => item !== '');
    // Convert to an object or array as needed
    if (cleanedData[0].includes(':')) {
        // Convert to an object (e.g., grades: "{20230003: 100}")
        return cleanedData.reduce((acc, item) => {
            const [key, value] = item.split(':');
            acc[key] = value;
            return acc;
        }, {});
    } else {
        // Convert to an array (e.g., entredID: "{20230003;}")
        return cleanedData;
    }
}

// Redirect to the exam page
function enterExam(examId) {
    localStorage.setItem("examId", examId); // Store examId in localStorage
    window.location.href = "Std_Exam.html"; // Redirect to the exam page
}

// Initialize the page by fetching exams
fetchSubjects();