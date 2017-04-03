base_path = './dist'
webpack_output = File.open(base_path + '/index.html') {|file| file.read}

scripts = ''
css = ''

webpack_output.split('src=').drop(1).each do |js|
    jspath = js.split('></script>').first
    print "Loading scripts from: #{jspath}\n\n"
    js = File.open(base_path + jspath) {|file| file.read}
    scripts << "\n\t<script>#{js}</script>"
end

webpack_output.split('<link href=').drop(1).each do |linktag|
    csspath = linktag.split(' rel=stylesheet>').first
    print "Loading styles from: #{csspath}\n\n"
    css = File.open(base_path + csspath) {|file| file.read}
end

html =
"<!DOCTYPE html>
<html>
    <head>
        <meta charset=utf-8>
        <title>geometry-editor</title>
        <style>
            #{css}
        </style>
    </head>

    <body>
        <div id=app></div>
        #{scripts}
    </body>
</html>"

output_file = File.new(base_path + '/build.html', 'w')
output_file.write(html)
output_file.close
