import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { Hono } from 'hono';
import { sign, verify } from 'hono/jwt'

// Create the main Hono app
const app = new Hono<{
	Bindings: {
		DATABASE_URL: string,
		JWT_SECRET: string,
	}
}>();

app.use('/api/v1/blog/*',async(c,next)=>
{
  const header = c.req.header("authorization")|| "";
  const token = header.split("")[1]

  const response  = await verify(header,"123")
  if(response.id){
    next()
  }
  else
  {
    c.status(403);
    return c.json({error:"unauthorized"});
  }
})

app.post('/api/v1/signup', async (c) =>
{

  const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());

	const body = await c.req.json();

	try 
  {
		const user = await prisma.user.create({
			data: {
				email: body.email,
				password: body.password,
			}
		});
    console.log(user);
		const jwt = await sign({ id: user.id },'123');
    console.log(jwt);
		return c.json({ jwt });
	} 
  catch(e)
  {
		c.status(403);
		return c.json({ error: "error while signing up" });
	}

})



//post
app.post('/api/v1/sigin',async (c) => 
{
  const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
  const body = await c.req.json();

  const user = await prisma.user.findUnique({
    where:{
      email:body.email,
      password:body.password
    }
  });

  if(!user)
  {
    c.status(403);
    return c.json({error:"user not found"});
  }

  const jwt = await sign({id:user.id},'123')
  return c.json({jwt});
})



app.post('/api/v1/blog', (c) => 
{
  return c.text('Hello Hono!')

})

app.put('/api/v1/blog', (c) => 
{
  return c.text('Hello Hono!')

})

app.get('/api/v1/blog/:id', (c) => 
{
  return c.text('Hello Hono!')

})

export default app
