export const bookingTemple = async (
  name: string,
  contact: string,
  vehicle: string,
  profile: string,
  date: string,
  time: string,
  services: string,
  addOns: string
) => `<html lang="en">
<head>
<meta charset="UTF-8">

<link href="https://fonts.googleapis.com/css2?family=Russo+One&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">

<style>

body{
margin:0;
padding:0;
font-family:'Poppins',Arial,Helvetica,sans-serif;
color:#222;
}

/* Container */

.email-container{
max-width:620px;
margin:20px auto;
border:1px solid #e5e5e5;
border-radius:10px;
overflow:hidden;
}

/* Header */

.header{
padding:30px;
text-align:center;
border-bottom:1px solid #e5e5e5;
}

.header h2{
margin:0;
font-family:'Russo One',Impact,sans-serif;
font-size:26px;
letter-spacing:2px;
}

/* Body */

.body{
padding:30px;
}

/* Fields */

.field{
margin-bottom:22px;
padding-bottom:16px;
border-bottom:1px solid #eee;
}

.field:last-child{
border-bottom:none;
margin-bottom:0;
}

/* Label */

.label{
display:block;
font-size:11px;
letter-spacing:2px;
text-transform:uppercase;
color:#888;
margin-bottom:6px;
font-weight:500;
}

/* Value */

.value{
font-size:16px;
line-height:1.6;
}

/* Email link */

.value a{
color:#c21d1d;
text-decoration:none;
}

/* Message */

.message-box{
border-left:3px solid #c21d1d;
padding-left:15px;
line-height:1.7;
}

/* Footer */

.footer{
padding:16px;
text-align:center;
font-size:12px;
color:#777;
border-top:1px solid #eee;
}

</style>
</head>

<body>

<div class="email-container">

<div class="header">
<h2>NEW BOOKING</h2>
</div>

<div class="body">

<div class="field">
<span class="label">Name</span>
<span class="value">${name}</span>
</div>

<div class="field">
<span class="label">Contact Number</span>
<span class="value">${contact}</span>
</div>

<div class="field">
<span class="label">Profile</span>
<span class="value">
<a href=${profile}>${profile}</a>
</span>
</div>

<div class="field">
<span class="label">Vehicle</span>
<span class="value">${vehicle}</span>
</div>

<div class="field">
<span class="label">Preferred Date</span>
<span class="value">${date}</span>
</div>

<div class="field">
<span class="label">Preferred Time Slot</span>
<span class="value">${time}</span>
</div>

<div class="field">
<span class="label">Services</span>
<div class="message-box">
${services}
</div>
</div>

<div class="field">
<span class="label">Add Ons Services</span>
<div class="message-box">
${addOns}
</div>
</div>

</div>

<div class="footer">
Red Line Detailing & Auto Spa
</div>

</div>

</body>
</html>`