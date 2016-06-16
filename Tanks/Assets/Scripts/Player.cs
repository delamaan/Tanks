using UnityEngine;
using System.Collections;

public class Player : MonoBehaviour {
  Rigidbody rigid;
  float speed = 5.0f;
  float rotationSpeed = 50f;
  float shotSpeed = 40f;
  float fireRate = 1f;
  float lastShot = 0f;
  Vector3 direction = Vector3.forward;

  public GameObject bullet;

	// Use this for initialization
	void Start () {
    rigid = this.GetComponent<Rigidbody>();
	}

  // Update is called once per frame
  void Update()
  {
    if (Input.GetKeyDown(KeyCode.LeftShift))
    {
      speed = 10.0f;
      rotationSpeed = 75f;
    }
    if (Input.GetKeyUp(KeyCode.LeftShift))
    {
      speed = 5.0f;
      rotationSpeed = 50f;
    }

    // MOVEMENT ------------------------------------------------------

    if (Input.GetKey(KeyCode.W))
    {
      rigid.velocity = speed * direction;
    }

    if (Input.GetKey(KeyCode.S))
    {
      rigid.velocity = speed * -direction;
    }

    if (Input.GetKey(KeyCode.A))
    {
      this.transform.Rotate(0, -rotationSpeed * Time.deltaTime, 0);
      direction = this.transform.forward;
    }

    if (Input.GetKey(KeyCode.D))
    {
      this.transform.Rotate(0, rotationSpeed * Time.deltaTime, 0);
      direction = this.transform.forward;
    }

    // OTHER ---------------------------------------------------------

    if (Input.GetKey(KeyCode.Space))
    {
      if (Time.time - lastShot > fireRate)
      {
        lastShot = Time.time;
        GameObject shot = Instantiate(bullet, this.transform.position, Quaternion.identity) as GameObject;
        shot.GetComponent<Rigidbody>().velocity = shotSpeed * direction;
      }
    }
  }
}
