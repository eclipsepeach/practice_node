var M = {
  v:'v',
  f:function(){
    console.log(this.v);
  }
}

// 여러 모듈이 담길 mpart.js파일에서, M이라는 객체를 모듈 바깥에서 사용할 수 있게 exports하겠다!
module.exports = M;
