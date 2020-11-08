$(document).ready(function () {

    let allStudents = [];
    let filteredClassStudents = [];
    let classArray = [];
    let presentCount = 0;
    let absentCount = 0;
    let isWeekValid = false;
    let selectAllTick = false;
    let selectAllCross = false;
    let attendanceMarkingDropdown = '';
    let markingDropdownItems = {
        'n': 'N (Not Required)',
        'p': 'P (Present)',
        'a': 'A (Absent)',
        's': 'S (Sick)',
        'e': 'E (Explained Absent)',
        'l': 'L (Late)',
        'c': 'C (Cancelled)'
    }

    Object.keys(markingDropdownItems).forEach(function (key) {
        // console.log('Key : ' + key + ', Value : ' + markingDropdownItems[key]);
        attendanceMarkingDropdown += '<option value="' + key + '">' + markingDropdownItems[key] + '</option>'
    });

    let weeks = '';
    for (let i = 0; i <= 16; i++) { // considering 16 weeks
        if (i !== 0) {
            weeks += '<option value="Week ' + i + '">Week ' + i + '</option>'
        } else {
            weeks += '<option value="select">--Select--</option>'
        }

    }
    $('#select-week').html(weeks);

    let classNumbersRow = '';
    let weekNumber = 0;
    let sessionNumber = '';
    for (let i = 1; i <= 32; i++) {
        if (i % 2 === 1) {
            weekNumber++;
            sessionNumber = 1;
        } else {
            sessionNumber = 2;
        }
        classNumbersRow += '<td class="class-number-rows" data-placement="bottom" title="Week ' + weekNumber + ' Session ' + sessionNumber + '"><label>' + i + '</label></td>';
    }
    $('#class-number-rows').html(classNumbersRow);

    // Get students data from the given API
    fetch('https://gist.githubusercontent.com/eallenOP/b40fa9bba517ff258da395c79edd2477/raw')
        .then(response => response.json())
        .then(data => {
            let students = [];
            data.forEach(student => {
                students.push(student);
                classArray.push(student.class);
            });
            classDropDown();
            allStudents = students;
            console.log(allStudents.length);
            filteredClassStudents = filterClassStudents(students);
            addStream();
            // filterStudents();
            // selectAllStudents();
            selectSession();
            selectWeek();
            dropDownMarking();
        });


    // Testing radio buttons to square box
    $('#radioGroup input').on('change', function () {
        console.log($('input[name=radioFruit]:checked', '#radioGroup').val());
    });

    // Filling class drop down list
    function classDropDown() {
        let uniqueClassArray = new Set(classArray);
        let classDropDownItems = '';
        uniqueClassArray.forEach(element => {
            classDropDownItems += '<option value="' + element + '">' + element + '</option>'
        });
        $('#select-class').html(classDropDownItems);
    }

    // Filter students based on class
    function filterClassStudents(students) {
        let filteredStudents = students.filter(x => x.class === $('#select-class').val());    // Filter students from array based on class
        return filteredStudents;
    }

    // Change Class
    $('#select-class').change(function () {
        console.log('changed');
        filteredClassStudents = allStudents.filter(x => x.class === $(this).val());
        console.log(filteredClassStudents.length);
        selectAllTick = false;
        selectAllCross = false;
        filterStudents();
        dropDownMarking();
    });

    // Change session on drop down list
    $('#select-session').change(function () {
        selectSession();
        filterStudents();
    });

    // Change Week number
    $('#select-week').change(function () {
        selectWeek();
        filterStudents();
    });

    // Change stream
    $('#stream').change(function () {
        filterStudents();

    });

    //Select All checkbox hovering
    $('#selectAll').tooltip({
        trigger: 'hover'
    }).css('cursor', 'pointer');

    //Attendance history class numbers hovering
    $('.class-number-rows').tooltip({
        trigger: 'hover'
    }).css('cursor', 'pointer');


    //Select All checkbox click
    $('#selectAll').click(function () {
        if ($('#selectAll').is(':checked')) {
            $('#selectAllMarking').show();
            selectAllTick = false;
            $('.student-checkbox').prop('checked', true);
            $('.student').addClass('highlight');
        } else if ($('#selectAll').is(':not(:checked)')) {
            $('.student-checkbox').prop('checked', false);
            $('.student').removeClass('highlight');
            $('#selectAllMarking').hide();
        }
        clearStudentDetails();
    })

    // Click select All tick marking button
    $('#select-all-tick').on('click', function () {
        if (selectAllTick) {
            selectAllTick = false;
        } else {
            selectAllTick = true;
        }
        $('#students-list').find('tr').each(function () {
            let querySelector = $(this).find('.tickMark');
            markingAllPresent(querySelector, $(this));
        });
    });

    // Click select All Cross marking button
    $('#select-all-cross').on('click', function () {
        if (selectAllCross) {
            selectAllCross = false;
        } else {
            selectAllCross = true;
        }
        $('#students-list').find('tr').each(function () {
            let querySelector = $(this).find('.crossMark');
            markingAllAbsent(querySelector, $(this));
        });
    });

    // Click select All Cancel marking button
    $('#select-all-cancel').on('click', function () {
        $('#students-list').find('tr').each(function () {
            markingAllCancel($(this));
        });
        presentCount = 0;
        absentCount = 0;
        $('#present-count').text(presentCount);
        $('#absent-count').text(absentCount);
    });

    // Select Week number
    function selectWeek() {
        if ($('#select-week').val() === 'select') {
            isWeekValid = false;
            $('.marking-td .tickMark').prop('disabled', true);
            $('.marking-td .crossMark').prop('disabled', true);
            $('.dropDownMarking').prop('disabled', true);
            $('#save').removeClass('save').addClass('save-disabled');
            $('#save').prop('disabled', true);
            $('#selectAll').prop('disabled', true);
            $('#selectAll').prop('checked', false);
            $('.student-checkbox').prop('checked', false);
            $('.student').removeClass('highlight');
            $('#selectAllMarking').hide();
        } else {
            isWeekValid = true;
            $('.marking-td .tickMark').prop('disabled', false);
            $('.marking-td .crossMark').prop('disabled', false);
            $('.dropDownMarking').prop('disabled', false);
            $('#save').removeClass('save-disabled').addClass('save');
            $('#save').prop('disabled', false);
            $('#selectAll').prop('disabled', false);
        }
    }

    // Select class number on drop down list
    function selectSession() {
        if (filteredClassStudents[0].attendance[$('#select-session').val() - 1]) {
            populateStudents(filteredClassStudents);
        } else {
            populateStudents(filteredClassStudents);
        }
    }

    // adding stream to students
    function addStream() {
        let week = [];
        for (let i = 0; i < 16; i++) {
            week.push({
                'class1': 1,
                'class2': 2
            });
        };

        allStudents.forEach((student, index) => {
            student.marking = 'n';  // add new key:value pair to store marking attendance. By default it is 'n' => 'not required'
            student.history = [];
            student.attendanceHistory = [];
            let weekNumber = 0;
            for (let i = 0; i < 32; i++) {
                let classNumber = '';
                if (i % 2 == 0) {
                    classNumber = 'Week ' + ++weekNumber + ' ' + 'Session 1';
                } else {
                    classNumber = 'Week ' + weekNumber + ' ' + 'Session 2';
                }
                student.attendanceHistory.push({
                    'class': classNumber,
                    'mark': ''
                });
            }
            if (index % 2 == 0) {
                student.stream = 'stream_a';
                student.attendance.forEach((attendance, index) => {
                    if (attendance === 'p') {
                        student.attendanceHistory[index].mark = 'P1';
                    } else {
                        student.attendanceHistory[index].mark = attendance;
                    }
                });
            } else {
                student.stream = 'stream_b';
                student.attendance.forEach((attendance, index) => {
                    if (attendance === 'p') {
                        student.attendanceHistory[index].mark = 'P2';
                    } else {
                        student.attendanceHistory[index].mark = attendance;
                    }
                });
            }
        });

    }

    //Edit students marking
    function editStudentsMarking(students) {
        presentCount = 0;
        absentCount = 0;
        $("table > tbody > tr").each(function () {
            let markingPresentClass = 'marking-default';
            let markingAbsentClass = 'marking-default';
            let activeStudentId = $(this).data('id');
            let activeStudent = students.filter(x => x.id == activeStudentId);
            let currentSession = $('#select-week').val() + ' ' + $('#select-session').val();
            let indexNumber = findIndex(activeStudent[0].attendanceHistory, 'class', currentSession);
            if ($('#select-week').val() !== 'select') {
                switch (activeStudent[0].attendanceHistory[indexNumber].mark) {
                    case 'p':
                        markingPresentClass = 'present';
                        presentCount++;
                        $(this).find('.dropDownMarking').val('p');
                        break;
                    case 'P1':
                        markingPresentClass = 'present';
                        presentCount++;
                        $(this).find('.dropDownMarking').val('p');
                        break;
                    case 'P2':
                        markingPresentClass = 'present';
                        presentCount++;
                        $(this).find('.dropDownMarking').val('p');
                        break;
                    case 'a':
                        markingAbsentClass = 'absent';
                        $(this).find('.dropDownMarking').val('a');
                        absentCount++;
                        break;
                    case 's':
                        $(this).find('.dropDownMarking').val('s');
                        break;
                    case 'e':
                        $(this).find('.dropDownMarking').val('e');
                        break;
                    case 'l':
                        $(this).find('.dropDownMarking').val('l');
                        break;
                    case 'c':
                        $(this).find('.dropDownMarking').val('c');
                        break;
                    default:
                        $(this).find('.dropDownMarking').val('n');
                        break;
                }
            }

            $(this).find('.tickMark').addClass(markingPresentClass);
            $(this).find('.crossMark').addClass(markingAbsentClass);
        });
        $('#present-count').text(presentCount);
        $('#absent-count').text(absentCount);
    }

    // Displaying students in table
    function populateStudents(filteredStudents) {
        let studentsList = '';
        presentCount = 0;
        absentCount = 0;
        filteredStudents.forEach((student, index) => {
            let attendanceHistory = '';
            let markingPresentClass = 'marking-default';
            let markingAbsentClass = 'marking-default';
            let disabledProp = '';
            if (!isWeekValid) {
                disabledProp = 'disabled';
            }

            let attendanceMarking = '<button type="button" class="btn btn-sm tickMark ' + markingPresentClass
                + '"' + disabledProp + '>&#x2713;</button>'
                + ' ' + '<button type="button" class="btn btn-sm crossMark ' + markingAbsentClass
                + '"' + disabledProp + '>&#x2718;</button>'
                + '&nbsp;<select class="dropDownMarking"' + disabledProp + '>' + attendanceMarkingDropdown + '</select>';

            student.attendanceHistory.forEach((attendance, index) => {
                let markingClass = '';
                switch (attendance.mark) {
                    case 'p':
                        markingClass = 'present';
                        break;
                    case 'P1':
                        markingClass = 'present';
                        break;
                    case 'P2':
                        markingClass = 'present';
                        break;
                    case 'a':
                        markingClass = 'absent';
                        break;
                    case 'n':
                        markingClass = 'marking-default';
                        break;
                    case 's':
                        markingClass = 'marking-default';
                        break;
                    case 'e':
                        markingClass = 'marking-default';
                        break;
                    case 'l':
                        markingClass = 'marking-default';
                        break;
                    case 'c':
                        markingClass = 'marking-default';
                        break;
                    default:
                        markingClass = '';
                        break;
                }
                attendanceHistory += '<td><label class="history ' + markingClass + '">'
                    + student.attendanceHistory[index].mark + '</label></td>';
            });
            studentsList += '<tr class="student" data-id="' + student.id + '">'
                + '<td><input class="student-checkbox" type="checkbox" disabled></td>'
                + '<th scope="row">' + (index + 1) + '</th>'
                + '<td>' + student.name.first + ' ' + student.name.last + '</td>'
                + '<td class="marking-td">' + attendanceMarking + '</td>'
                + attendanceHistory
                + '</tr>';

        });
        $('#select-all').addClass('select-all');
        $("#students-list").html(studentsList);

        selectStudent();
        markingStudent();
        $('#present-count').text(presentCount);
        $('#absent-count').text(absentCount);
        // arrowkeySelectionRow();

    }

    // Drop down marking selection
    function dropDownMarking() {
        $('.dropDownMarking').change(function () {
            console.log('called');
            if ($(this).val() === 'p') {
                markingPresent($(this).closest('tr').find('.tickMark'), $(this).closest('tr'));
            } else if ($(this).val() === 'a') {
                markingAbsent($(this).closest('tr').find('.crossMark'), $(this).closest('tr'));
            } else if ($(this).val() === 'n') {
                dropDownMarkingOthers($(this).closest('tr').data('id'), 'n', $(this))
            } else if ($(this).val() === 's') {
                dropDownMarkingOthers($(this).closest('tr').data('id'), 's', $(this))
            } else if ($(this).val() === 'e') {
                dropDownMarkingOthers($(this).closest('tr').data('id'), 'e', $(this))
            } else if ($(this).val() === 'l') {
                dropDownMarkingOthers($(this).closest('tr').data('id'), 'l', $(this))
            } else {
                dropDownMarkingOthers($(this).closest('tr').data('id'), 'c', $(this))
            }
        })
    }

    // Drop down Marking - other than 'present' and 'absent'
    function dropDownMarkingOthers(activeStudentId, marking, thisElement) {
        let activeStudent = filteredClassStudents.find(x => x.id == activeStudentId);    // Find the element from students array
        if (activeStudent.marking === 'p') {
            activeStudent.marking = marking;
            $('#present-count').text(--presentCount);
            thisElement.closest('tr').find('.tickMark').removeClass('present').addClass('marking-default');
        } else if (activeStudent.marking === 'a') {
            activeStudent.marking = marking;
            $('#absent-count').text(--absentCount);
            thisElement.closest('tr').find('.crossMark').removeClass('absent').addClass('marking-default');
        } else {
            activeStudent.marking = marking;
        }
    }

    // Marking student attendance
    function markingStudent() {
        $('.tickMark').click(function () {
            let querySelector = $(this);
            markingPresent(querySelector, $(this).closest('tr'));
        });

        $('.crossMark').click(function () {
            let querySelector = $(this);
            markingAbsent(querySelector, $(this).closest('tr'));
        });
    }

    // Marking All Present
    function markingAllPresent(querySelector, thisElement) {
        let activeStudentId = thisElement.data('id');
        let activeStudent = filteredClassStudents.find(x => x.id == activeStudentId);    // Find the element from students array

        if (selectAllTick) {
            if (thisElement.find('.dropDownMarking').val() === 'p') {

            } else {
                thisElement.find('.dropDownMarking').val('p');
                activeStudent.marking = 'p';
                $('#present-count').text(++presentCount);
                let absentClassName = querySelector.siblings().attr('class');
                if (absentCount > 0 && absentClassName.includes('absent')) {
                    $('#absent-count').text(--absentCount);
                }
                thisElement.find('.crossMark').removeClass('absent').addClass('marking-default');
                querySelector.removeClass('marking-default').addClass('present');
            }
        } else {
            if (thisElement.find('.dropDownMarking').val() === 'p') {
                thisElement.find('.dropDownMarking').val('n');
                activeStudent.marking = 'n';
                $('#present-count').text(--presentCount);
                querySelector.removeClass('present').addClass('marking-default');
            } else {

            }

        }
        selectAllCross = false; //Reset to false, so that next time it will be Unclicked position.
    }

    // Marking All Absent
    function markingAllAbsent(querySelector, thisElement) {
        let activeStudentId = thisElement.data('id');
        let activeStudent = filteredClassStudents.find(x => x.id == activeStudentId);    // Find the element from students array

        if (selectAllCross) {
            if (thisElement.find('.dropDownMarking').val() === 'a') {

            } else {
                thisElement.find('.dropDownMarking').val('a');
                activeStudent.marking = 'a';
                $('#absent-count').text(++absentCount);
                let presentClassName = querySelector.siblings().attr('class');
                if (presentCount > 0 && presentClassName.includes('present')) {
                    $('#present-count').text(--presentCount);
                }
                thisElement.find('.tickMark').removeClass('present').addClass('marking-default');
                querySelector.removeClass('marking-default').addClass('absent');
            }
        } else {
            if (thisElement.find('.dropDownMarking').val() === 'a') {
                thisElement.find('.dropDownMarking').val('n');
                activeStudent.marking = 'n';
                $('#absent-count').text(--absentCount);
                querySelector.removeClass('absent').addClass('marking-default');
            } else {

            }
        }
        selectAllTick = false;
    }

    // Marking All Cancelled
    function markingAllCancel(thisElement) {
        let activeStudentId = thisElement.data('id');
        let activeStudent = filteredClassStudents.find(x => x.id == activeStudentId);    // Find the element from students array
        thisElement.find('.dropDownMarking').val('c');
        activeStudent.marking = 'c';
        thisElement.find('.tickMark').removeClass('present').addClass('marking-default');
        thisElement.find('.crossMark').removeClass('absent').addClass('marking-default');

        selectAllTick = false;
        selectAllCross = false;
    }

    // Marking Present
    function markingPresent(querySelector, thisElement) {
        let activeStudentId = thisElement.data('id');
        let activeStudent = filteredClassStudents.find(x => x.id == activeStudentId);    // Find the element from students array
        // activeStudent.attendance.push('p');
        if (activeStudent.marking === 'p') {
            thisElement.find('.dropDownMarking').val('n');
            activeStudent.marking = 'n';
            $('#present-count').text(--presentCount);
        } else {
            thisElement.find('.dropDownMarking').val('p');
            activeStudent.marking = 'p';
            $('#present-count').text(++presentCount);
            let absentClassName = querySelector.siblings().attr('class');
            if (absentCount > 0 && absentClassName.includes('absent')) {
                $('#absent-count').text(--absentCount);
            }
            thisElement.find('.crossMark').removeClass('absent').addClass('marking-default');
        }
        querySelector.toggleClass('marking-default present');
    }

    // Marking absent
    function markingAbsent(querySelector, thisElement) {
        querySelector.toggleClass('marking-default absent');
        let activeStudentId = thisElement.closest('tr').data('id');
        let activeStudent = filteredClassStudents.find(x => x.id == activeStudentId);    // Find the element from students array
        // activeStudent.attendance.push('a');
        if (activeStudent.marking === 'a') {
            thisElement.find('.dropDownMarking').val('n');
            activeStudent.marking = 'n';
            $('#absent-count').text(--absentCount);
        } else {
            thisElement.find('.dropDownMarking').val('a');
            activeStudent.marking = 'a';
            $('#absent-count').text(++absentCount);
            let presentClassName = querySelector.siblings().attr('class');
            if (presentCount > 0 && presentClassName.includes('present')) {
                $('#present-count').text(--presentCount);
            }
            thisElement.find('.tickMark').removeClass('present').addClass('marking-default');
        }
    }

    // Save button click
    $('#save').click(function () {
        if (confirm('Are you sure to save attendance markings?')) {
            saveMarking();
            clearStudentDetails();
        }
    })

    // Save marking
    function saveMarking() {
        filteredClassStudents.forEach(student => {
            if (student.marking === 'p') {
                if (student.stream === 'stream_a') {
                    student.marking = 'P1';
                } else {
                    student.marking = 'P2';
                }
            }
            let currentSession = $('#select-week').val() + ' ' + $('#select-session').val();
            let indexNumber = findIndex(student.attendanceHistory, 'class', currentSession);
            student.attendanceHistory[indexNumber].mark = student.marking;  //Save marking to the selected class session.
        });
        populateStudents(filteredClassStudents);
        resetStudentsTable();
    }

    //Reset students list table
    function resetStudentsTable() {
        // set marking as 'n'to reset students list in table.
        filteredClassStudents.forEach(student => {
            student.marking = 'n';
        });
        $('#students-list').find('tr').each(function () {
            $(this).find('.tickMark').removeClass('present').addClass('marking-default');
            $(this).find('.crossMark').removeClass('absent').addClass('marking-default');
        });
        $('#present-count').html('0');
        $('#absent-count').html('0');
        presentCount = 0;
        absentCount = 0;
        $('#select-week').val('select');
        selectWeek();
        $('#selectAll').prop('checked', false);
        $('#radioGroupMarking').hide();
        dropDownMarking();
    }
    //Find index of the current session
    function findIndex(array, attr, value) {
        for (var i = 0; i < array.length; i += 1) {
            if (array[i][attr] === value) {
                return i;
            }
        }
        return -1;
    }
    // Clicking a student row in students list table
    function selectStudent() {
        $('.student').click(function () {
            $(this).siblings().removeClass('highlight');
            $(this).addClass('highlight');
            let activeStudentId = $(this).data('id');
            let activeStudent = filteredClassStudents.filter(x => x.id == activeStudentId);    // Filtering the element from students array
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
        filteredStreamStudents = [];
        filteredClassStudents.forEach(student => {
            if ($('#stream').val() === 'all') {
                filteredStreamStudents.push(student);
            }
            else if (student.stream === $('#stream').val()) {
                filteredStreamStudents.push(student);
            }
        });
        populateStudents(filteredStreamStudents);
        editStudentsMarking(filteredStreamStudents);
        clearStudentDetails();
    }

    // Up and down arrow keys to select row
    function arrowkeySelectionRow() {
        let addEvent = (function (window, document) {
            if (document.addEventListener) {
                return function (elem, type, cb) {
                    if ((elem && !elem.length) || elem === window) {
                        elem.addEventListener(type, cb, false);
                    }
                    else if (elem && elem.length) {
                        let len = elem.length;
                        for (let i = 0; i < len; i++) {
                            addEvent(elem[i], type, cb);
                        }
                    }
                };
            }
            else if (document.attachEvent) {
                return function (elem, type, cb) {
                    if ((elem && !elem.length) || elem === window) {
                        elem.attachEvent('on' + type, function () { return cb.call(elem, window.event) });
                    }
                    else if (elem.length) {
                        let len = elem.length;
                        for (let i = 0; i < len; i++) {
                            addEvent(elem[i], type, cb);
                        }
                    }
                };
            }
        })(this, document);

        //derived from: http://stackoverflow.com/a/10924150/402706
        function getpreviousSibling(element) {
            let p = element;
            do p = p.previousSibling;
            while (p && p.nodeType != 1);
            return p;
        }

        //derived from: http://stackoverflow.com/a/10924150/402706
        function getnextSibling(element) {
            let p = element;
            do p = p.nextSibling;
            while (p && p.nodeType != 1);
            return p;
        }

        let trows = document.getElementById("students").rows;

        for (let t = 1; t < trows.length; ++t) {
            trow = trows[t];
            trow.className = "normal";
            trow.onclick = highlightRow;
        }//end for

        function highlightRow() {
            for (let t = 1; t < trows.length; ++t) {
                trow = trows[t];
                if (trow != this) { trow.className = "normal" }
            }//end for

            this.className = (this.className == "highlighted") ? "normal" : "highlighted";
        }//end function

        addEvent(document.getElementById('students'), 'keydown', function (e) {
            let key = e.keyCode || e.which;

            if ((key === 38 || key === 40) && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {

                let highlightedRows = document.querySelectorAll('.highlighted');

                if (highlightedRows.length > 0) {

                    let highlightedRow = highlightedRows[0];

                    let prev = getpreviousSibling(highlightedRow);
                    let next = getnextSibling(highlightedRow);

                    if (key === 38 && prev && prev.nodeName === highlightedRow.nodeName) {//up
                        highlightedRow.className = 'normal';
                        prev.className = 'highlighted';
                    } else if (key === 40 && next && next.nodeName === highlightedRow.nodeName) { //down
                        highlightedRow.className = 'normal';
                        next.className = 'highlighted';
                    }

                }
            }

        });

    }

});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  