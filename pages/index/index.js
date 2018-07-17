//index.js
const weatherMap={
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}
const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}
const amapFile = require('../../libs/amap-wx.js');
const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2
const UNPROMPTED_TIPS = "点击获取当前位置"
const UNAUTHORIZED_TIPS = "点击开启位置权限"
const AUTHORIZED_TIPS = ""
Page({
  data:{
    nowTemp:'',
    nowWeather:'',
    nowWeatherBg:'',
    hourlyWeather:[],
    todayDate:'',
    todayTemp:'',
    city:'上海市',
    locationAuthType:UNPROMPTED,
    locationTips:UNPROMPTED_TIPS,
  },
  /**
   * 下拉刷新页面
   */
  onPullDownRefresh(){
    this.getWeather(()=>{
      wx.stopPullDownRefresh();
    });
  },
  onLoad(){
    wx.getSetting({
      success:res => {
       let auth= res.authSetting['scope.userLocation'];
       this.setData({
         locationAuthType:auth?AUTHORIZED:(auth === false)?UNAUTHORIZED:UNPROMPTED,
         locationTips:auth?AUTHORIZED_TIPS:(auth === false)?UNAUTHORIZED_TIPS:UNPROMPTED_TIPS
       });
       if(auth){
         this.getLocation();
       }else{
         this.getWeather();
       }
      }
    })
  },
  onShow(){
  //  wx.getSetting({
  //    success:res => {
  //     let auth= res.authSetting['scope.userLocation']
  //     if (auth && this.data.locationAuthType !=AUTHORIZED){
  //       //权限从无到有
  //       this.setData({
  //         locationAuthType: AUTHORIZED,
  //         locationTips: AUTHORIZED_TIPS
  //       });
  //       this.getLocation();
  //     }
  //    }
  //  })
  },
  getWeather(callBack){
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data:{
        city:this.data.city,
      },
      success:res=>{
        //获取返回的数值
        let result = res.data.result;
        //设置当前的天气
        this.setNowWeather(result);
        //显示未来天气
        this.setHourlyWeather(result);

        this.setToday(result);
      },
      complete:()=>{
        callBack && callBack()
      }
    })
  },
  setNowWeather(result){
    let temp = result.now.temp;
    let weather = result.now.weather;
    this.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherBg: '/images/' + weather + '-bg.png',
    });
    //设置导航栏背景色
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    });
  },
  setHourlyWeather(result){
    let hourlyWeather = [];
    let hour = new Date().getHours();
    let forecast = result.forecast;
    for (let i = 0; i < forecast.length; i++) {
      hourlyWeather.push({
        time: (i * 3 + hour) % 24 + "时",
        iconPath: "/images/weather/" + forecast[i].weather + "-icon.png",
        temp: forecast[i].temp + '°',
      });
    }
    hourlyWeather[0].time = "现在";
    this.setData({ "hourlyWeather": hourlyWeather });
  },
  setToday(result){
    let now=new Date();
    this.setData({
      todayDate:`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`,
      todayTemp:`${result.today.minTemp}°-${result.today.maxTemp}°`
    });
  },
  /**
   * 页面跳转
   */
  onTapDayWeather(){
    // wx.showToast({
    // });
    wx.navigateTo({
      url: '/pages/list/list?city='+this.data.city,
    })
  },
  /**
   * 点击获取当前位置
   */
  onTapLocation(){
    if (this.data.locationAuthType === UNAUTHORIZED){
      wx.openSetting({
        success: res =>{
          let auth=res.authSetting['scope.userLocation']
          if(auth){
            this.getLocation();
          }
        }
        })
    }else{
      this.getLocation();
    }    
  },
  /**
   * 获取当前的位置
   */
  getLocation(){
    var myAmapFun = new amapFile.AMapWX({ key: 'b09a8c4349c8e4cbbb093be6779a50e4' });
    myAmapFun.getWeather({
      success: data => {
        this.setData({
          locationAuthType: AUTHORIZED,
          locationTips: AUTHORIZED_TIPS
        });
        //成功回调
        let city = data.city.data;
        this.setData({
          city: city,
          locationTips: ''
        });
        this.getWeather();
      },
      fail: () => {
        //失败回调
        this.setData({
          locationAuthType: UNAUTHORIZED,
          locationTips: UNAUTHORIZED_TIPS
        });
      }
    });
  }
})