// //初回のみモーダルをすぐ出す判定。flagがモーダル表示のstart_open後に代入される
// var access = $.cookie('access')
// if(!access){
//   flag = true;
//   $.cookie('access', false);
// }else{
//   flag = false  
// }
//モーダル表示
$(".inline").modaal({
    // start_open:flag,
    content_source: '#inline',
    animation_speed:0,
});

$('.inline').on('click', function () {
  // モーダル1に行く際に他のモーダルを閉じる
  $('.inline2').modaal('close');
})

$(".inline2").modaal({
  content_source: '#inline2',
  animation_speed:0
});

$('.inline2').on('click', function () {
  // モーダル2に行く際に他のモーダルを閉じる
  $('.inline').modaal('close');
  $('.inline3').modaal('close');
})

$(".inline3").modaal({
  // start_open:flag,
  content_source: '#inline3',
  animation_speed:0,
});

$('.inline3').on('click', function () {
  // モーダル3に行く際に他のモーダルを閉じる
  $('.inline2').modaal('close');
})
