var ProjectTree = {

    init: function() {      
      ProjectTree.projectLists      = $('#listOfProjects');
      ProjectTree.testResult        = $('.results_section');
      ProjectTree.projectTitle      = $('#project_title');
      ProjectTree.searchBox         = $('#search_form');
      ProjectTree.searchButton      = $('#search_button');
      ProjectTree.defaultGraphStyle = 'line';
      ProjectTree.commitsArray      = [];
      ProjectTree.dataPoints        = [];
      ProjectTree.bindEventsToImages();
      ProjectTree.searchButton.click(ProjectTree.search);
      $('#sub_canvas h2').hide();
    },

    generateURL: function() {
      var queryString = ProjectTree.searchBox.val(); 
      var newUrl = 'https://api.github.com/orgs/' + queryString + '/repos';
      return newUrl;
    },

    flipImages: function() {
      $('#newBar').attr('src', 'images/graph.png').removeClass('img-circle');
      $('#newPie').attr('src', 'images/pie_chart.png').removeClass('img-circle');
      $('#newLine').attr('src', 'images/line.png').removeClass('img-circle');
      $('#newArea').attr('src', 'images/area.png').removeClass('img-circle');
    },

    defineGraphStyle: function() {
      var currentId = '';
      $('.largeImg').removeClass('selectedImage');
      $(this).addClass('selectedImage');
      $(this).siblings().removeClass('selectedImage');
      currentId = $(this).attr('alt');
        switch (currentId) {
          case 'pie': 
            ProjectTree.defaultGraphStyle = 'pie';
            return ProjectTree.defaultGraphStyle;
          break;
          case 'bar':
           ProjectTree.defaultGraphStyle = 'bar';
           return ProjectTree.defaultGraphStyle;
          break;
          case 'line':
            ProjectTree.defaultGraphStyle = 'line';
            return ProjectTree.defaultGraphStyle;
          break;
          case 'area':
            ProjectTree.defaultGraphStyle = 'area';
            return ProjectTree.defaultGraphStyle;
          break;
          default:
            ProjectTree.defaultGraphStyle = 'bar';
        }
    },



    bindEventsToImages: function() {
      $('#selectImages').children().click(ProjectTree.defineGraphStyle);
      $('.largeImg').click(ProjectTree.defineGraphStyle);
    },

    countCommitters: function(array) {
     var count = {};
      $.each(array, function(i){
          count[this] = count[this] + 1 || 1;
      });
      ProjectTree.generateGraphData(count);
      return count;
   },

   getCommitNames: function(response) {
      $.each(response, function(i){
        ProjectTree.commitsArray.push(response[i].commit.committer.name);
      });
      ProjectTree.countCommitters(ProjectTree.commitsArray);  
   },

    generateGraphData: function(object) {      
      for (var i in object) {
        var dataPointsObject = {};
        dataPointsObject.label = i;
        dataPointsObject.y = object[i];
        ProjectTree.dataPoints.push(dataPointsObject);
      }
      ProjectTree.plotGraph(ProjectTree.dataPoints);
    },

    plotGraph: function(newArray) {
      ProjectTree.flipImages();
        var chart = new CanvasJS.Chart("canvasSection", {

          title:{
            text: "Projects worked on and the number of commits"              
          },
          data: [             
            {
             type: ProjectTree.defaultGraphStyle,
             dataPoints: newArray
            }
          ]
         });
        chart.render();
        $('#canvasSection').show();
    },

    getCommits: function() {
      ProjectTree.commitsArray = [];
      ProjectTree.dataPoints   = [];
      $('#selectImages').hide();
      $('#sub_canvas h2').hide();
      ProjectTree.projectTitle.text('');
      ProjectTree.projectTitle.text($(this).text());
      $(this).siblings().removeClass( "blueBG" );
      $(this).addClass( "blueBG" );
      $.ajax({
        type: 'GET',
        url: 'https://api.github.com/repos/' + $(this).text() + '/commits',
        success: function(response) {          
          ProjectTree.getCommitNames(response);
        },
        error: function(err) {
          $('#preloader').hide();
          $('#errrorMsg').show();
          $('#errrorMsg').text(err.statusText);
        }
      });  
    },

    clearFields: function() {
      ProjectTree.projectLists.children().remove();
      $('#canvasSection').hide();
      $('#errrorMsg').hide();

    },

    search: function() {
      $('#selectImages').hide();
      $('#preloader').show();
      ProjectTree.clearFields();

      var url = ProjectTree.generateURL();
      $.ajax({
        type: 'GET',
        url: url,
        success: function(response) {
          var ListItems = '';
          $('#sub_canvas h2').show();
          $('#selectImages').show();
          $.each(response, function(i){
            ListItems += '<li class="list-group-item glyphicon glyphicon-file">' + response[i].full_name + '</li>';
          });
          $('#companyName').addClass("capitalize");
          $('#companyName').text(ProjectTree.searchBox.val());
          $('#preloader').hide();
          ProjectTree.clearFields();
          ProjectTree.projectLists.append(ListItems);          
          ProjectTree.projectLists.children('li').click(ProjectTree.getCommits);
        },
        error: function(err) {
          $('#preloader').hide();
          $('#errrorMsg').show();
          $('#errrorMsg').text(err.statusText);          
        }
      });
    }

};

$(document).ready(ProjectTree.init);
