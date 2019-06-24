    //var force : Vector3;
    var car : Transform;
    var power : int;
    var MaxSpeed : int = 150;
    var currentSpeed : float;
    //private var trigfunction : Vector3;
    var ccamera : Camera;
    //private var max : Vector3;
    var fwheel : Transform;
    var bwheel : Transform;
    var fWheelCollider : WheelCollider;
    var bWheelCollider : WheelCollider;
    var gearRatio : int[];
    
    private var distance : float;
    private var startTime: float = 0;
    private var point: Vector3;
    private var object: GameObject;
    private var duration: float;
    private var beginningBikeSoundPitch : float;
    //var raycast : Transform;
    //var isgrounded : boolean;
    var CenterOfMass : Vector3;
    private var crashed : boolean = false;
    //var flipped : boolean;
        
    function Start () 
    {
    	//max.Set(8,8,0);
    	rigidbody.centerOfMass=CenterOfMass;
    	crashed = false;
    	
    	ccamera.transparencySortMode = TransparencySortMode.Perspective;
    	beginningBikeSoundPitch = audio.pitch;
    } 
    
    function Update()
	{ 
		EngineSound();
	
		if (Input.GetMouseButtonDown(0))
		{ 
			var hit: RaycastHit; 
			var ray = Camera.main.ScreenPointToRay(Input.mousePosition); 
			
			if (Physics.Raycast(ray, hit))
			{ 
				startTime = Time.time; point = hit.point; 
				object = hit.transform.gameObject; 
				var name : String;
				name = object.name;
				
				if(name == "greenGrip")
					ApplyGas();
				else if(name == "brakeRotor")
					ApplyBrake();
			} 
		} 
		else if (Input.GetMouseButtonUp(0))
		{ 
			duration = Time.time - startTime; 
			
			if(currentSpeed > 0)
				ApplyGas(-20);
		} 
	}
       
    function FixedUpdate () 
    {			
		//rotate wheel image
		fwheel.Rotate(0,0,fWheelCollider.rpm/60*360*Time.deltaTime * -1);
		bwheel.Rotate(0,0,bWheelCollider.rpm/60*360*Time.deltaTime * -1);
		
		currentSpeed = 2*22/7*bWheelCollider.radius*bWheelCollider.rpm*60/1000;
		currentSpeed = Mathf.Round(currentSpeed);
	}
	
	function OnTriggerEnter (col : Collider)
	{
		if(col.name == "MeshPiece")
		{
			if(!crashed)
				gamestate.Instance.SetLives(gamestate.Instance.getLives() - 1);
			
			if(gamestate.Instance.getLives() <= 0)
			{
				Application.LoadLevel("gameover");
			}
			else
			{
				crashed = true;
			}
		}
		else if(col.name == "Coin")
		{
			if(!crashed)
				gamestate.Instance.SetScore(gamestate.Instance.GetScore() + 1);
		}
	}
	
	function OnGUI()
	{
		if(crashed)
		{
			GUI.contentColor = Color.white;
			
			if(GUI.Button(Rect(Screen.width*0.5-50,200-20,100,40),"Try Again"))
			{
				Application.LoadLevel(Application.loadedLevel);
			}
		}
	}
	
    function ApplyGas()
    {
    	ApplyGas(power);
    }
    
    function ApplyGas(torque : int)
    {
    	if(currentSpeed < MaxSpeed && !crashed)
    	{
	    	bWheelCollider.brakeTorque = 0;
	    	bWheelCollider.motorTorque += torque;
    	}
    	else
    		bWheelCollider.motorTorque = 0;
    }
    
    function ApplyBrake()
    {
    	if(!crashed)
    	{
	    	bWheelCollider.brakeTorque += 20;
	       	bWheelCollider.motorTorque = 0;
       	}
    }
       
    function LateUpdate () {
    	//After we move, adjust the camera to follow the player
        ccamera.transform.position = new Vector3(transform.position.x, transform.position.y, ccamera.transform.position.z);
    }
    
    function EngineSound()
    {
		for (var i = 0; i < gearRatio.length; i++){
			if(gearRatio[i]> currentSpeed){
				break;
			}
		}
		
		var gearMinValue : float = 0.00;
		var gearMaxValue : float = 0.00;
		
		if (i == 0){
			gearMinValue = 0;
		}
		else {
			gearMinValue = gearRatio[i-1];
		}
		
		if(i > gearRatio.Length - 1)
			i = gearRatio.Length - 1;
			
		gearMaxValue = gearRatio[i];
		var enginePitch : float = ((currentSpeed - gearMinValue)/(gearMaxValue - gearMinValue))+1;
		
		if(enginePitch >= beginningBikeSoundPitch)//keep it from going lower than starting value
			audio.pitch = enginePitch;
	}