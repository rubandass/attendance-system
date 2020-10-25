$(document).ready(function () {
    console.log("==============");
    let students = [];
    let filteredStudents = [];
    let presentCount = 0;
    let absentCount = 0;
    let allSelected = false;

    // let url = '';

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
            filteredStudents = students;
            addStream();
            populateStudents(students);
            filterStudents();
            selectAllStudents();
        });


    // Select all rows
    function selectAllStudents() {
        $('#select-all').click(function () {
            if ($('#select-all').attr('class').includes('select-all')) {
                $('#select-all').removeClass('select-all');
                $('.student').addClass('highlight');
                allSelected = true;
            } else {
                $('#select-all').addClass('select-all');
                $('.student').removeClass('highlight');
                allSelected = false;
            }
            clearStudentDetails();
        })
    }

    // adding stream to students
    function addStream() {
        students.forEach((student, index) => {
            student.marking = 'n';  // add new key:value pair to store marking attendance. By default it is 'n' => 'no marking'
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
            let markingPresentClass = '';
            let markingAbsentClass = '';
            if (student.marking === 'p') {
                markingPresentClass = 'present';
            } else {
                markingPresentClass = 'marking-default';
            }
            if (student.marking === 'a') {
                markingAbsentClass = 'absent';
            } else {
                markingAbsentClass = 'marking-default';
            }
            let attendanceMarking = '<button type="button" class="btn btn-sm tickMark ' + markingPresentClass + '">&#10004;</button>' + ' ' + '<button type="button" class="btn btn-sm crossMark ' + markingAbsentClass + '">&#x2718;</button>';
            student.attendance.forEach(marking => {
                attendanceHistory += '<button type="button" class="btn btn-sm">' + marking + '</button>';
            });
            studentsList += '<tr class="student" data-id="' + student.id + '"><th scope="row">' + (index + 1) + '</th>' + '<td>' + student.name.first + ' ' + student.name.last + '</td>'
                + '<td>' + attendanceMarking + '</td>'
                + '<td>' + attendanceHistory + '</td>'
                + '</tr>';
        });
        $('#select-all').addClass('select-all');
        $("#students-list").html(studentsList);
        selectStudent();
        markingStudent();
    }

    // Marking student attendance
    function markingStudent() {
        $('.tickMark').click(function () {
            if (allSelected) {
                // Read all table rows if user selects 'Select All'
                $('#students-list').find('tr').each(function () {
                    let querySelector = $(this).find('.tickMark');
                    markingPresent(querySelector, $(this));
                });
            } else {
                let querySelector = $(this);
                markingPresent(querySelector, $(this).closest('tr'));
            }
            allSelected = false;
        });

        $('.crossMark').click(function () {
            if (allSelected) {
                // Read all table rows if user selects 'Select All'
                $('#students-list').find('tr').each(function () {
                    let querySelector = $(this).find('.crossMark');
                    markingAbsent(querySelector, $(this));
                });
            } else {
                let querySelector = $(this);
                markingAbsent(querySelector, $(this).closest('tr'));
            }
            allSelected = false;
        });
    }

    // Marking Present
    function markingPresent(querySelector, thisElement) {
        querySelector.toggleClass('marking-default present');
        let activeStudentId = thisElement.data('id');
        let activeStudent = students.find(x => x.id == activeStudentId);    // Find the element from students array
        // activeStudent.attendance.push('p');
        if (activeStudent.marking === 'p') {
            activeStudent.marking = 'n';
            $('#present-count').text(--presentCount);
        } else {
            activeStudent.marking = 'p';
            $('#present-count').text(++presentCount);
            let absentClassName = querySelector.siblings().attr('class');
            if (absentCount > 0 && absentClassName.includes('absent')) {
                $('#absent-count').text(--absentCount);
            }
            querySelector.siblings().removeClass('absent').addClass('marking-default');
        }
    }

    // Marking absent
    function markingAbsent(querySelector, thisElement) {
        querySelector.toggleClass('marking-default absent');
        let activeStudentId = thisElement.closest('tr').data('id');
        let activeStudent = students.find(x => x.id == activeStudentId);    // Find the element from students array
        // activeStudent.attendance.push('a');
        if (activeStudent.marking === 'a') {
            activeStudent.marking = 'n';
            $('#absent-count').text(--absentCount);
        } else {
            activeStudent.marking = 'a';
            $('#absent-count').text(++absentCount);
            let presentClassName = querySelector.siblings().attr('class');
            if (presentCount > 0 && presentClassName.includes('present')) {
                $('#present-count').text(--presentCount);
            }
            querySelector.siblings().removeClass('present').addClass('marking-default');
        }
    }
    // Clicking a student row in students list table
    function selectStudent() {
        $('.student').click(function () {
            $(this).siblings().removeClass('highlight');
            $(this).addClass('highlight');
            let activeStudentId = $(this).data('id');
            let activeStudent = students.filter(x => x.id == activeStudentId);    // Filtering the element from students array
            studentDetails(activeStudent);
            $('#select-all').addClass('select-all');
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
            filteredStudents = [];
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