dist_path = './dist'
src_path = './src'

webpack_output = File.open(dist_path + '/index.html') {|file| file.read}

scripts = ''
css = ''

webpack_output.split('src=').drop(1).each do |js|
    jspath = js.split('></script>').first
    print "Loading scripts from: #{jspath}\n\n"
    js = File.open(dist_path + jspath) {|file| file.read}
    scripts << "\n\t#{js}"
end

webpack_output.split('<link href=').drop(1).each do |linktag|
    csspath = linktag.split(' rel=stylesheet>').first
    print "Loading styles from: #{csspath}\n\n"
    css = File.open(dist_path + csspath) {|file| file.read}
end

base_html =
"<!DOCTYPE html>
<html>
    <head>
        <meta charset=utf-8>
        <title>Floorspace JS</title>
        <style>
            #{css}
        </style>
    </head>

    <body>
        <div id=app></div>
"
standalone_html = base_html + "
    <script>#{scripts}</script>
    </body>
</html>"

output_file = File.new(dist_path + '/standalone_geometry_editor.html', 'w')
output_file.write(standalone_html)
output_file.close

print "Loading floorspace.js API script from: #{src_path + '/api.js'}\n\n"
api_scripts = File.open(src_path + '/api.js') {|file| file.read}
lodash = File.open('./node_modules/lodash/lodash.js') {|file| file.read}

# the newline after #{scripts} is important, removing it causes everything after #{scripts} to be interpreted as a comment
embeddable_html = base_html + "
    <script> #{lodash} </script>
    <script>
      window.startApp = function() {
        #{scripts}
      }
    </script>
    <script> #{api_scripts} </script>
    </body>
</html>"

output_file = File.new(dist_path + '/embeddable_geometry_editor.html', 'w')
output_file.write(embeddable_html)
output_file.close
