$(document).ready(function () {
    console.log("==============");
    let students = [];
    let url = '';

    // fetch('https://api.github.com/gists/b40fa9bba517ff258da395c79edd2477')
    //     .then(response => response.json())
    //     .then(data => {
    //         url = data.git_pull_url.slice(0, -4);
    //         console.log(url);
    //     });

    fetch('https://gist.githubusercontent.com/eallenOP/b40fa9bba517ff258da395c79edd2477/raw')
        .then(response => response.json())
        .then(data => {
            data.forEach(student => {
                students.push(student);
            });
            addStream();
            populateStudents(students);
            // selectStudent();
            // markingStudent();
            filterStudents();
        });


    // adding stream to students
    function addStream() {
        students.forEach((student, index) => {
            if (index % 2 == 0) {
                student.stream = 'stream_a';
            } else {
                student.stream = 'stream_b';
            }
        })
    }
    // Displaying students in table
    function populateStudents(filteredStudents) {
        let studentsList = '';
        filteredStudents.forEach((student, index) => {
            let attendanceHistory = '';
            let attendanceMarking = '<button type="button" class="btn btn-sm presentMark present-default">&#10004;</button>' + ' ' + '<button type="button" class="btn btn-sm absentMark absent-default">&#x2718;</button>';
            student.attendance.forEach(marking => {
                attendanceHistory += '<button type="button" class="btn btn-sm">' + marking + '</button>';
            });
            studentsList += '<tr class="student" data-id="' + student.id + '"><th scope="row">' + (index + 1) + '</th>' + '<td>' + student.name.first + ' ' + student.name.last + '</td>'
                + '<td>' + attendanceMarking + '</td>'
                + '<td>' + attendanceHistory + '</td>'
                + '</tr>';
        });

        $("#students-list").html(studentsList);
        selectStudent();
        markingStudent();
    }

    // Marking student attendance
    function markingStudent() {
        $('.presentMark').click(function () {
            $(this).toggleClass('present');
            console.log($(this).closest('tr'));
        });
        $('.absentMark').click(function () {
            $(this).toggleClass('absent');
        });
    }
    // Clicking a student row in students list table
    function selectStudent() {
        $('.student').click(function () {
            $(this).siblings().removeClass('highlight');
            $(this).addClass('highlight');
            let activeStudentId = $(this).data('id');
            let activeStudent = students.filter(x => x.id == activeStudentId);    // Filtering the element from students array
            studentDetails(activeStudent);
        });
    }

    // Filling student details on the right side panel
    function studentDetails(student) {
        $('#name').text(student[0].name.first + ' ' + student[0].name.last);
        $('#id').text(student[0].id);
        $('#email').text(student[0].email);
        $('#phone').text(student[0].phone);
        $('#address').text(student[0].address);
        $('#ethnicity').text(student[0].ethnicity);
    }

    // Clear Student Details when change stream occurs
    function clearStudentDetails() {
        $('#name').text('');
        $('#id').text('');
        $('#email').text('');
        $('#phone').text('');
        $('#address').text('');
        $('#ethnicity').text('');
    }
    // filter students based on stream selection
    function filterStudents() {
        $('#stream').change(function () {
            let filteredStudents = [];
            students.forEach(student => {
                if (this.value === 'all') {
                    filteredStudents.push(student);
                }
                else if (student.stream === this.value) {
                    filteredStudents.push(student);
                }
            });
            populateStudents(filteredStudents);
            clearStudentDetails();
        });
    }

});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  