$ErrorActionPreference = "Stop"

$patch = @'
{"spec":{"template":{"spec":{"initContainers":[{"name":"copyutil","image":"quay.io/argoproj/argocd:v3.3.4","command":["sh","-c"],"args":["/bin/cp --update=none /usr/local/bin/argocd /var/run/argocd/argocd && /bin/ln -sf /var/run/argocd/argocd /var/run/argocd/argocd-cmp-server"]}]}}}}
'@

$tmpPatchFile = Join-Path $env:TEMP "argocd-repo-server-patch.json"
$patch | Set-Content -Path $tmpPatchFile -NoNewline

try {
  kubectl patch deployment argocd-repo-server -n argocd --type merge --patch-file $tmpPatchFile
} finally {
  if (Test-Path $tmpPatchFile) {
    Remove-Item $tmpPatchFile -Force
  }
}
