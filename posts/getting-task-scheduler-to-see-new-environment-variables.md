---
title: 'Getting Task Scheduler to see new environment variables'
date: '2017-04-30'
excerpt: 'How to get Task Scheduler to see new environment variables without a reboot'
tags: ['AWS', 'EC2', 'PowerShell', 'Windows']
author: 'Wesley Kirkland'
---

I recently encountered a opportunity that required me to set an environment variable in my user data script for my EC2 instance, and then I had a scheduled task that started to run immediately. The scheduled task was never able to see the environment variable unless I rebooted the instance. EC2 is capable of handling reboots as long as it is the last line in your user data. But that is ugly and takes much longer, especially considering I am running 2016 base on a t2.micro instance. Because my application is a series of scripts and nothing more.Setting the environment variable works flawlessly via this PowerShell command.

```powershell
[Environment]::SetEnvironmentVariable(‘MachineEnviroment’,”$Environment”,’Machine’)
```

The task scheduler service “Schedule” is already started before this environment variable is set. I was able to find a trick of abusing the SYSTEM account and restarting the Schedule service. In my userdata file I added the following command which executes as SYSTEM because all userdata files from EC2 on Windows always executes as SYSTEM without any special configuration.

```powershell
Get-Service Schedule | Restart-Service
```

You can see what environment variables that a process has loaded with [Process Explorer](https://technet.microsoft.com/en-us/sysinternals/processexplorer.aspx) from [Sys Internals](https://technet.microsoft.com/en-us/sysinternals/bb545021.aspx).

![Process Explorer showing environmental variables](/images/blog/2017/getting-task-scheduler-to-see-new-environment-variables/process_explorer_environment_variables.png 'Process Explorer showing environmental variables')

Sources

- https://community.spiceworks.com/topic/359268-restarting-the-task-scheduler-service-in-windows-2008
- http://superuser.com/questions/331077/accessing-environment-variables-in-a-scheduled-task
