



function Crystal( page , params ){

  this.page = page;
  this.params = _.defaults(  params || {} , {

    height:100,
    width:30,
    numOf:100,
    note:'sniperGlory1',
    extraHeight: 10

  });

  this.looper = this.page.looper;

  var p = this.params;


  this.hovered          = false;
  this.selected         = false;
  this.active           = false;

  this.preparingToPlay  = false;
  this.preparingToStop  = false;
  this.playing          = false;

  
  this.scene    = new THREE.Object3D();
  //this.position = this.scene.position;  
 
  this.note = this.page.audio[ this.params.note ];
  this.looper.everyLoop( this.note.play.bind( this.note ) );
  
  this.gain = this.note.gain.gain;
  this.gain.value = 0;


  this.t_audio = { type:"t" , value:this.note.texture}

  var h = p.height *( 1 + ( Math.random() -.5 ) * .4 );
  var w = p.width *( 1 + ( Math.random() -.5 ) * .4 );
  var n = Math.floor( p.numOf *( 1 + ( Math.random() -.5 ) * 1.4 ));

  this.height = h;
  this.width = w;
  this.size = n;


  this.geometry = CrystalGeo( h , w , n  , this.params.extraHeight ); 
  this.material = this.createMaterial();
 
  this.mesh = new THREE.Mesh( this.geometry , this.material );
  this.mesh.rotation.x = Math.PI/2;

  this.mesh.hoverOver = this.hoverOver.bind( this );
  this.mesh.hoverOut  = this.hoverOut.bind( this );
  this.mesh.select    = this.select.bind( this );

  this.scene.add( this.mesh );

  G.objectControls.add( this.mesh );
  
  this.baseData = this.geometry.baseData; 

  this.halo = new CrystalHalo( this.height, this.baseData , this.t_audio );

  this.halo.mesh.rotation.x = Math.PI/2;
  this.scene.add( this.halo.mesh );
 
  this.particles = new CrystalParticles( this.scene ,  this.height , this.t_audio );
  this.scene.add( this.particles.particles );

}


Crystal.prototype.activate = function(){

  this.page.scene.add( this.scene );
  this.active = true;

}

Crystal.prototype.update = function(){

  if( !this.active ) return;

  this.particles.update();
  this.note.update();

}

Crystal.prototype.hoverOver = function(){


  this.material.uniforms.hovered.value = 1;
  this.hovered = true;


}

Crystal.prototype.hoverOut = function(){

  this.material.uniforms.hovered.value = 0;
  this.hovered = true;


}

Crystal.prototype.select = function(){

  
  this.selected = !this.selected;

  if( this.selected ){
    
    this.prepareToPlay();

  }else{
    
    this.prepareToStop();

  }


}


Crystal.prototype.prepareToPlay = function(){

  this.material.uniforms.selected.value = 1;
  this.preparingToPlay = true;
  this.mesh.material.color = this.selectedColor;
  this.looper.onNextMeasure( this.play.bind( this ) );


}

Crystal.prototype.play = function(){
 
  this.material.uniforms.playing.value = 1;

  this.preparingToPlay = false;
  this.playing = true;
   
  this.gain.value = 1;

}

Crystal.prototype.prepareToStop = function(){
  
  this.material.uniforms.selected.value = 0;

  this.preparingToStop = true;
  this.mesh.material.color = this.hoveredColor;
  this.looper.onNextMeasure( this.stop.bind( this ) );

}

Crystal.prototype.stop = function(){

  this.material.uniforms.playing.value = 0;
  
  this.preparingToStop = false;
  this.playing = false;
   
  this.gain.value = 0;

}

Crystal.prototype.createMaterial = function(){


  var uniforms = {

    t_audio:this.t_audio,
    lightPos:{ type: "v3" , value : G.iPoint }, 
    cameraPos:{ type:"v3" , value : G.camera.position },
    hovered:{ type:"f" , value:0},
    playing:{ type:"f" , value:0},
    selected:{ type:"f" , value:0}
      
  }

 
  var attributes = {

    id:{ type:"f" , value:null },

  }

  var material = new THREE.ShaderMaterial({

    uniforms: uniforms,
    attributes: attributes,
    vertexShader: G.shaders.vs.crystal,
    fragmentShader: G.shaders.fs.crystal

  });

  return material;


}

Crystal.prototype.getRandomColor = function(){

  var color = new THREE.Color();
  color.r = Math.random();
  color.g = Math.random();
  color.b = Math.random();

  return color;

}