const RESEND_API_KEY = "re_JxpVtnR9_CR9GtsxtMEcRyA3QzfFtd38E" 

const SendMail = () => {

    const handleSendMail = async() => {
        const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Acme <onboarding@resend.dev>',
      to: ['delivered@resend.dev'],
      subject: 'hello world',
      html: '<strong>it works!</strong>',
    }),
  });

  if (res.ok) {
    const data = await res.json();
    return Response.json(data);
  }
    }
     
  return (
    <button onClick={handleSendMail}>SendMail</button>
  )
}

export default SendMail