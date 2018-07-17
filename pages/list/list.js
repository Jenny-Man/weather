// pages/list/list.js
const weekMap=["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
Page({
  data:{
    city:'上海市',
    weekWeather:[]
  },
  onLoad(options){
    this.setData({
      city: options.city
    });
    this.getWeekWeather();
  },
  onPullDownRefresh(){
    this.getWeekWeather(()=>{
      wx.stopPullDownRefresh();
    });
  },
  getWeekWeather(callback){
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/future',
      data:{
        city:this.data.city,
        time:new Date().getTime()
      },
      success:res =>{
        let result=res.data.result;
        let weekWeather=[];
        for(let i=0;i<result.length;i++){
          let date=new Date();
          date.setDate(date.getDate()+i);
          weekWeather.push({
            day: weekMap[date.getDay()],
            date:`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
            temp: `${result[i].minTemp}°-${result[i].maxTemp}°`,
            iconPath:`/images/weather/${result[i].weather}-icon.png`
          });
        }
        this.setData({
          weekWeather
        });
      },
      complete:() =>{
        callback && callback();
      }
    })
  }
})