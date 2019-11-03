using UnityEngine;
using System.Collections;

public class PlayerMovement_Forward : MonoBehaviour
{
	
    public Camera playerCamera;
	
    public float speed = 12.0F;
    public float jumpSpeed = 8.0F;
    public float gravity = 20.0F;
    private Vector3 moveDirection = Vector3.zero;
	private bool dead = false;
	private int jumps = 0;

    void Start()
    {
        if (playerCamera == null)
        {
            playerCamera = Camera.main;
        }

		GetComponent<Animation>()["flip"].layer = 1;
		GetComponent<Animation>()["death"].layer = 1;
		//animation["attack"].layer = 1;

        playerCamera.transparencySortMode = TransparencySortMode.Perspective;
    }

    void Update()
    {    
		if(!dead)
		{
	        CharacterController controller = GetComponent<CharacterController>();
	        if (controller.isGrounded)
	        {
				moveDirection = new Vector3(0, 0, 1);
	            moveDirection = transform.TransformDirection(moveDirection);
	            moveDirection *= speed;

				jumps = 0;
	        }

			if (Input.GetButton("Jump") || Input.touchCount > 0)
			{
				if(jumps < 3)
				{
					jumps++;
					GetComponent<Animation>().Play("flip");
					
					moveDirection.y = jumpSpeed;
				}
			} 

	        moveDirection.y -= gravity * Time.smoothDeltaTime;
	        controller.Move(moveDirection * Time.smoothDeltaTime);
		}

        //After we move, adjust the camera to follow the player
        playerCamera.transform.position = new Vector3(transform.position.x, transform.position.y + 10, playerCamera.transform.position.z);
    }

	void OnTriggerEnter (Collider col)
	{
		string name = "";

		if(col.name == "enemy")
		{
			if(!dead)
				gamestate.Instance.SetLives(gamestate.Instance.getLives() - 1);
			
			if(gamestate.Instance.getLives() <= 0)
			{
				Application.LoadLevel("gameover");
			}
			else
			{
				GetComponent<Animation>().Play("death");
				col.GetComponent<Animation>()["die"].layer = 1;
				col.GetComponent<Animation>().Play("die");
				dead = true;
				GetComponent<Animation>().Stop("run");
				GetComponent<Animation>().Stop("attack");
				col.GetComponent<Animation>().Stop("run");
				col.GetComponent<Animation>().Stop("attack");

				SoundEffectsHelper.Instance.MakeDyingSound();
			}
		}
		else if(col.name == "Coin")
		{
			if(!dead)
				gamestate.Instance.SetScore(gamestate.Instance.GetScore() + 1);
		}
		else
			name = col.name;
	}

	void OnGUI()
	{
		if(dead)
		{
			GUI.contentColor = Color.white;
			
			if(GUI.Button(new Rect((Screen.width*0.5f-50f),180f,200,80),"Try Again"))
			{
				Application.LoadLevel(Application.loadedLevel);
			}
		}
	}
}
