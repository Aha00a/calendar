# calendar
https://aha00a.github.io/calendar/

이렇게 쓸만한 달력이 없다니.. 걍 만들고 말지..

## Requirements
  * 월화수목금토일
  * 대한민국의 공휴일을 표시
  * 군더더기 없이, 화면크기 관계없이 그냥 3개월치만 표시
  * 이전달 다음달 이동버튼
  * 미구현사항
    * landscape, portrait에 따라 가로 세로 레이아웃
  * 안중요한 요구사항
    * static하게 돌아가야함. - github page로 올릴거라서 server필요없어야 함. 충족했음.
    * IE11도 지원하기. 현재는 지원하지만, 상황에 따라 빼버릴까 싶기도..
      * IE11을 포기하면 얻을 수 있는 이점. 
        * `async/await` 쓸 수 있음
        * `vmin` 쓸 수 있음.
    * mobile 지원하기
      * 현재 prev/next 버튼의 height가 100%가 안되는 문제가 있음. 고치던지.. 버리던지.. 고민중.. 그 외에는 다 잘 됨.
  * 추가로 드는 생각
    * 음력을 지금 로컬에서 미리 계산해놓고 client에서는 결과만 갖다 쓰는데, static해야하지 않다면 음력 api를 따로 만들까 싶기도..      

## 참고URL
 * 음양력변환계산 - https://astro.kasi.re.kr/life/pageView/8
 * 공휴일 - https://ko.wikipedia.org/wiki/대한민국의_공휴일#현행_공휴일
