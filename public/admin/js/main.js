(function ($) {
    

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Sidebar Toggler
    $('.sidebar-toggler').click(function () {
        $('.sidebar, .content').toggleClass("open");
        return false;
    });


    // Progress Bar
    $('.pg-bar').waypoint(function () {
        $('.progress .progress-bar').each(function () {
            $(this).css("width", $(this).attr("aria-valuenow") + '%');
        });
    }, {offset: '80%'});


    // Calender
    $('#calender').datetimepicker({
        inline: true,
        format: 'L'
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        items: 1,
        dots: true,
        loop: true,
        nav : false
    });


    // Chart Global Color
    Chart.defaults.color = "#6C7293";
    Chart.defaults.borderColor = "#000000";


    const jan = document.getElementById('monthlyOrdersChart1').value;
    const feb = document.getElementById('monthlyOrdersChart2').value;
    const mar = document.getElementById('monthlyOrdersChart3').value;
    const apr = document.getElementById('monthlyOrdersChart4').value;
    const may = document.getElementById('monthlyOrdersChart5').value;
    const june = document.getElementById('monthlyOrdersChart6').value;
    const july = document.getElementById('monthlyOrdersChart7').value;
    const aug = document.getElementById('monthlyOrdersChart8').value;
    const sep = document.getElementById('monthlyOrdersChart9').value;
    const oct = document.getElementById('monthlyOrdersChart10').value;
    const nav = document.getElementById('monthlyOrdersChart11').value;
    const dec = document.getElementById('monthlyOrdersChart12').value;

    const jan1 = document.getElementById('monthlyOrdersChart13').value;
    const feb2 = document.getElementById('monthlyOrdersChart14').value;
    const mar3 = document.getElementById('monthlyOrdersChart15').value;
    const apr4 = document.getElementById('monthlyOrdersChart16').value;
    const may5 = document.getElementById('monthlyOrdersChart17').value;
    const june6 = document.getElementById('monthlyOrdersChart18').value;
    const july7 = document.getElementById('monthlyOrdersChart19').value;
    const aug8 = document.getElementById('monthlyOrdersChart20').value;
    const sep9 = document.getElementById('monthlyOrdersChart21').value;
    const oct10 = document.getElementById('monthlyOrdersChart22').value;
    const nav11 = document.getElementById('monthlyOrdersChart23').value;
    const dec12 = document.getElementById('monthlyOrdersChart24').value;

    const jan13 = document.getElementById('monthlyOrdersChart25').value;
    const feb14 = document.getElementById('monthlyOrdersChart26').value;
    const mar15 = document.getElementById('monthlyOrdersChart27').value;
    const apr16 = document.getElementById('monthlyOrdersChart28').value;
    const may17 = document.getElementById('monthlyOrdersChart29').value;
    const june18= document.getElementById('monthlyOrdersChart30').value;
    const july19 = document.getElementById('monthlyOrdersChart31').value;
    const aug20 = document.getElementById('monthlyOrdersChart32').value;
    const sep21 = document.getElementById('monthlyOrdersChart33').value;
    const oct22 = document.getElementById('monthlyOrdersChart34').value;
    const nav23 = document.getElementById('monthlyOrdersChart35').value;
    const dec24 = document.getElementById('monthlyOrdersChart36').value;




    const year24 = document.getElementById('YearlySalesData').value;
    const year25 = document.getElementById('YearlySalesData1').value;
    const year26 = document.getElementById('YearlySalesData2').value;
    const year27 = document.getElementById('YearlySalesData3').value;
    
    const year241 = document.getElementById('YearlySalesData4').value;
    const year251 = document.getElementById('YearlySalesData5').value;
    const year261 = document.getElementById('YearlySalesData6').value;
    const year271 = document.getElementById('YearlySalesData7').value;

    
    

    // Worldwide Sales Chart
    var ctx1 = $("#worldwide-sales").get(0).getContext("2d");
    var myChart1 = new Chart(ctx1, {
        type: "bar",
        data: {
            labels: [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ],
            datasets: [{
                    label: "Sales",
                    data: [jan,feb,mar,apr,may,june,july,aug,sep,oct,nav,dec],
                    backgroundColor: "rgba(235, 22, 22, .7)"
                },
                {
                    label: "Users",
                    data:[jan1,feb2,mar3,apr4,may5,june6,july7,aug8,sep9,oct10,nav11,dec12] ,
                    backgroundColor: "rgba(235, 22, 22, .5)"
                },

                {
                    label: "Orders",
                    data: [jan13,feb14,mar15,apr16,may17,june18,july19,aug20,sep21,oct22,nav23,dec24],
                    backgroundColor: "rgba(235, 22, 22, .3)"
                }
            ]
            },
        options: {
            responsive: true
        }
    });


    // Salse & Revenue Chart
    var ctx2 = $("#salse-revenue").get(0).getContext("2d");
    var myChart2 = new Chart(ctx2, {
        type: "line",
        data: {
            labels: [ "2024","2025","2026","2027"],
            datasets: [{
                    label: "Sales",
                    data: [year24,year25,year26,year27],
                    backgroundColor: "rgba(235, 22, 22, .7)",
                    fill: true
                },
                {
                    label: "Deliverd Orders",
                    data: [year241,year251,year261,year271],
                    backgroundColor: "rgba(235, 22, 22, .5)",
                    fill: true
                }
            ]
            },
        options: {
            responsive: true
        }
    });
    


    // // Single Line Chart
    // var ctx3 = $("#line-chart").get(0).getContext("2d");
    // var myChart3 = new Chart(ctx3, {
    //     type: "line",
    //     data: {
    //         labels: [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150],
    //         datasets: [{
    //             label: "Salse",
    //             fill: false,
    //             backgroundColor: "rgba(235, 22, 22, .7)",
    //             data: [7, 8, 8, 9, 9, 9, 10, 11, 14, 14, 15]
    //         }]
    //     },
    //     options: {
    //         responsive: true
    //     }
    // });


    // // Single Bar Chart
    // var ctx4 = $("#bar-chart").get(0).getContext("2d");
    // var myChart4 = new Chart(ctx4, {
    //     type: "bar",
    //     data: {
    //         labels: ["Italy", "France", "Spain", "USA", "Argentina"],
    //         datasets: [{
    //             backgroundColor: [
    //                 "rgba(235, 22, 22, .7)",
    //                 "rgba(235, 22, 22, .6)",
    //                 "rgba(235, 22, 22, .5)",
    //                 "rgba(235, 22, 22, .4)",
    //                 "rgba(235, 22, 22, .3)"
    //             ],
    //             data: [55, 49, 44, 24, 15]
    //         }]
    //     },
    //     options: {
    //         responsive: true
    //     }
    // });


    // // Pie Chart
    // var ctx5 = $("#pie-chart").get(0).getContext("2d");
    // var myChart5 = new Chart(ctx5, {
    //     type: "pie",
    //     data: {
    //         labels: ["Italy", "France", "Spain", "USA", "Argentina"],
    //         datasets: [{
    //             backgroundColor: [
    //                 "rgba(235, 22, 22, .7)",
    //                 "rgba(235, 22, 22, .6)",
    //                 "rgba(235, 22, 22, .5)",
    //                 "rgba(235, 22, 22, .4)",
    //                 "rgba(235, 22, 22, .3)"
    //             ],
    //             data: [55, 49, 44, 24, 15]
    //         }]
    //     },
    //     options: {
    //         responsive: true
    //     }
    // });


    // // Doughnut Chart
    // var ctx6 = $("#doughnut-chart").get(0).getContext("2d");
    // var myChart6 = new Chart(ctx6, {
    //     type: "doughnut",
    //     data: {
    //         labels: ["Italy", "France", "Spain", "USA", "Argentina"],
    //         datasets: [{
    //             backgroundColor: [
    //                 "rgba(235, 22, 22, .7)",
    //                 "rgba(235, 22, 22, .6)",
    //                 "rgba(235, 22, 22, .5)",
    //                 "rgba(235, 22, 22, .4)",
    //                 "rgba(235, 22, 22, .3)"
    //             ],
    //             data: [55, 49, 44, 24, 15]
    //         }]
    //     },
    //     options: {
    //         responsive: true
    //     }
    // });

    
})(jQuery);

