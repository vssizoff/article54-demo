local system = require 'pandoc.system'

local doc_template = [[
\documentclass[tikz,border=2pt]{standalone}
\usepackage{tikz}
%s
\begin{document}
\begin{tikzpicture}
%s
\end{tikzpicture}
\end{document}
]]

local function tex2svg(src, outfile)
  local f = io.open('tikz-temp.tex', 'w')
  f:write(doc_template:format('', src))
  f:close()
  os.execute('lualatex -interaction=nonstopmode tikz-temp.tex')
  os.execute('pdf2svg tikz-temp.pdf ' .. outfile)
end

function RawBlock(el)
  if el.format == 'latex' and el.text:match('\\begin{tikzpicture}') then
    local id = pandoc.sha1(el.text)
    local out = 'media/tikz-' .. id .. '.svg'
    tex2svg(el.text, out)
    return pandoc.Para({ pandoc.Image({}, out) })
  end
end