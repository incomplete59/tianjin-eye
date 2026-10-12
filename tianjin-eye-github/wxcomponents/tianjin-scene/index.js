const createScene=require('./lib/scene');
Component({
  properties:{
    night:{type:Boolean,value:false},playing:{type:Boolean,value:true},speed:{type:Number,value:1},
    active:{type:Boolean,value:true},resetToken:{type:Number,value:0},zoomSteps:{type:Number,value:0},reloadToken:{type:Number,value:0}
  },
  observers:{
    night(v){this.applyState({night:v});},playing(v){this.applyState({playing:v});},
    speed(v){this.applyState({speed:v});},active(v){this.applyState({active:v});},
    resetToken(v){this.applyState({resetToken:v});},
    zoomSteps(v){this.applyState({zoomSteps:v});},
    reloadToken(v){this.applyState({reloadToken:v});}
  },
  lifetimes:{
    ready(){this.mounted=true;this.pageVisible=true;this.initialize();},
    detached(){this.mounted=false;this.generation=(this.generation||0)+1;if(this.engine)this.engine.dispose();this.engine=null;}
  },
  pageLifetimes:{
    show(){this.pageVisible=true;if(this.engine)this.engine.setActive((this.sceneState||this.properties).active);},
    hide(){this.pageVisible=false;if(this.engine)this.engine.setActive(false);},
    resize(){this.measure(false);}
  },
  methods:{
    applyState(patch){
      const previous=this.sceneState||Object.assign({},this.properties);
      const state=Object.assign({},previous,patch);this.sceneState=state;
      if(state.reloadToken!==previous.reloadToken&&this.mounted){this.initialize();return;}
      if(!this.engine)return;
      this.engine.setNight(state.night);this.engine.setPlaying(state.playing);this.engine.setSpeed(state.speed);
      this.engine.setActive(state.active&&this.pageVisible!==false);
      if(state.resetToken!==previous.resetToken)this.engine.reset();
      if(state.zoomSteps!==(this.lastZoom||0))this.engine.zoom(Math.pow(.88,state.zoomSteps-(this.lastZoom||0)));
      this.lastZoom=state.zoomSteps;
    },
    initialize(){if(this.engine)this.engine.dispose();this.engine=null;this.generation=(this.generation||0)+1;this.measure(true);},
    measure(create){
      const generation=this.generation;
      this.createSelectorQuery().select('#eye-canvas').fields({node:true,size:true}).exec(results=>{
        if(!this.mounted||generation!==this.generation)return;
        const item=results&&results[0];
        if(!item||!item.node||!item.width||!item.height){this.triggerEvent('sceneerror',{message:'未获取到 3D 画布，请重新加载。'});return;}
        if(!create){if(this.engine)this.engine.resize(item.width,item.height);return;}
        try{
          const info=wx.getWindowInfo?wx.getWindowInfo():wx.getSystemInfoSync();
          this.engine=createScene(item.node,item.width,item.height,info.pixelRatio,message=>this.triggerEvent('sceneerror',{message}),progress=>this.triggerEvent('themechange',{progress}));
          const state=this.sceneState||this.properties;
          this.lastZoom=state.zoomSteps;this.applyState(state);
          this.triggerEvent('ready');
        }catch(e){console.error(e);this.triggerEvent('sceneerror',{message:e.message||'3D 画面启动失败，请重试。'});}
      });
    },
    onTouchStart(e){if(this.engine)this.engine.touchStart(e.touches||[]);},
    onTouchMove(e){if(this.engine)this.engine.touchMove(e.touches||[]);},
    onTouchEnd(e){if(this.engine)this.engine.touchEnd(e.touches||[]);},
    onContextLost(){if(this.engine)this.engine.contextLost();}
  }
});
