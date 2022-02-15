// 1. 서버 사용을 위해서 http 모듈을 http 변수에 담는다. (모듈과 변수의 이름은 달라도 된다.)
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');
var template = require('./lib/template.js');
const sanitizeHtml = require('sanitize-html');


// 2. http 모듈로 서버를 생성한다.
//    아래와 같이 작성하면 >> 서버를 생성한 후, 사용자로부터 http 요청이 들어오면 function 블럭내부의 코드를 실행해서 응답한다.
var app = http.createServer(function(request,response){
    var _url = request.url;
    //parse는 추출한다는 뜻으로 parse함수를 사용하면 쿼리스트링을 객체로 변환하여 리턴.
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    console.log(pathname);

    if(pathname === '/'){
      if(queryData.id === undefined){
          fs.readdir('./data', function(error, filelist){
            var title = 'Welcome';
            var description = 'Hello stranger.';
            var list = template.list(filelist);
            var html = template.HTML(title, list,`<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`);
          response.writeHead(200);
          response.end(html);
          });


    }else{
      fs.readdir('./data', function(error, filelist){
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`,'utf8', function(err, description){
          var title = queryData.id;
          var sanitizedTitle = sanitizeHtml(title);
          var sanitizedDescription = sanitizeHtml(description, {
            allowedTags:['p'] //일부 태그만 허용하고 싶을 때
          });
          var list = template.list(filelist);
          var html = template.HTML(sanitizedTitle, list,`<h2>${title}</h2>${sanitizedDescription}`,
          `<a href="/create">create</a>
          <a href="/update?id=${sanitizedTitle}">update</a>
          <form action="delete_process" method="post">
            <input type="hidden" name="id" value="${sanitizedTitle}">
            <input type="submit" value="delete">
          </form>
          `);
    response.writeHead(200);
    response.end(html);

    });
  });
}

}else if(pathname === '/create'){
  fs.readdir('./data', function(error, filelist){
    var title = 'WEB - create';
    var list = template.list(filelist);
    var html = template.HTML(title, list,
      `<form action="/create_process" method="post">
      <p><input type="text" name="title" placeholder="title"></p>
      <p>
        <textarea name="description" placeholder="description"></textarea>
      </p>
      <p>
        <input type="submit">
      </p>
      </form>`,''
    );
  response.writeHead(200);
  response.end(html);
});
}else if(pathname === '/create_process'){
  var body="";

  request.on('data', function(data){
    body = body+data;
  });
  request.on('end', function(){
    var post = qs.parse(body);
    var title = post.title;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8',function(err){
      response.writeHead(302, {Location:`/?id=${title}`});
      response.end();
    })
  });
}else if(pathname === '/update'){
  fs.readdir('./data', function(error, filelist){
    var filteredId = path.parse(queryData.id).base;
    fs.readFile(`data/${filteredId}`,'utf8', function(err, description){
      var title = queryData.id;
      var list = template.list(filelist);
      var html = template.HTML(title, list,`
        <form action="/update_process" method="post">
        <input type="hidden" name="id" value="${title}">
        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
        <p>
          <textarea name="description" placeholder="description">${description}</textarea>
        </p>
        <p>
          <input type="submit">
        </p>
        </form>
        `,
      `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
response.writeHead(200);
response.end(html);

});
});

}else if(pathname === '/update_process'){
  var body="";

  request.on('data', function(data){
    body = body+data;
  });
  request.on('end', function(){
    var post = qs.parse(body);
    var id = post.id;
    var title = post.title;
    var description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function(error){
      fs.writeFile(`data/${title}`, description, 'utf8',function(err){
        response.writeHead(302, {Location:`/?id=${title}`});
        response.end();
        })
    })
    console.log(post);
  });

}else if(pathname === '/delete_process'){
  var body="";
  request.on('data', function(data){
    body = body+data;
  });
  request.on('end', function(){
    var post = qs.parse(body);
    var id = post.id;
    var filteredId = path.parse(id).base;

    fs.unlink(`data/${filteredId}`, function(error){
      response.writeHead(302, {Location:`/`});
      response.end();
    })
  });

}else{
    response.writeHead(404);
    response.end('Not found');
  }
});

// 3. listen 함수로 3200 포트를 가진 서버를 실행한다.
//    서버가 실행된 것을 콘솔창에서 확인하기 위해 'Server is running...' 로그를 출력한다
app.listen(3200, function(){
  console.log('Server is running...');
});
